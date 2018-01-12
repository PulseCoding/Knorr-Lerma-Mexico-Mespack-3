//Rechazos marcados como 0 requieren lógica de rechazo!!!
var fs = require('fs');
var modbus = require('jsmodbus');
var PubNub = require('pubnub');
try{
var publishConfig;
var secPubNub=0;
var files = fs.readdirSync("C:/PULSE/MESPACK3_LOGS/"); //Leer documentos
var text2send=[];//Vector a enviar
var i=0;

var Fillerct = null,
    Fillerresults = null,
    CntRejFiller = null,
    CntOutFiller = null,
    Filleractual = 0,
    Fillertime = 0,
    Fillersec = 0,
    FillerflagStopped = false,
    Fillerstate = 0,
    Fillerspeed = 0,
    FillerspeedTemp = 0,
    FillerflagPrint = 0,
    FillersecStop = 0,
    FillerONS = false,
    FillertimeStop = 60, //NOTE: Timestop
    FillerWorktime = 0.99, //NOTE: Intervalo de tiempo en minutos para actualizar el log
    FillerflagRunning = false,
    PreInFiller=null,
    FillerdeltaRejected=null;
var Xrayct = null,
    Xrayresults = null,
    CntInXray = null,
    CntOutXray = null,
    Xrayactual = 0,
    Xraytime = 0,
    Xraysec = 0,
    XrayflagStopped = false,
    Xraystate = 0,
    Xrayspeed = 0,
    XrayspeedTemp = 0,
    XrayflagPrint = 0,
    XraysecStop = 0,
    XraydeltaRejected = null,
    XrayONS = false,
    XraytimeStop = 60, //NOTE: Timestop
    XrayWorktime = 0.99, //NOTE: Intervalo de tiempo en minutos para actualizar el log
    XrayflagRunning = false,
    XrayRejectFlag = false,
    XrayReject,
    XrayVerify = (function(){
     try{
       XrayReject = fs.readFileSync('XrayRejected.json')
       if(XrayReject.toString().indexOf('}') > 0 && XrayReject.toString().indexOf('{\"rejected\":') != -1){
         XrayReject = JSON.parse(XrayReject)
       }else{
         throw 12121212
       }
     }catch(err){
       if(err.code == 'ENOENT' || err == 12121212){
         fs.writeFileSync('XrayRejected.json','{"rejected":0}') //NOTE: Change the object to what it usually is.
         XrayReject = {
           rejected : 0
         }
       }
     }
   })();
   var Checkweigherct = null,
       Checkweigherresults = null,
       CntInCheckweigher = null,
       CntOutCheckweigher = null,
       Checkweigheractual = 0,
       Checkweighertime = 0,
       Checkweighersec = 0,
       CheckweigherflagStopped = false,
       Checkweigherstate = 0,
       Checkweigherspeed = 0,
       CheckweigherspeedTemp = 0,
       CheckweigherflagPrint = 0,
       CheckweighersecStop = 0,
       CheckweigherdeltaRejected = null,
       CheckweigherONS = false,
       CheckweighertimeStop = 60, //NOTE: Timestop
       CheckweigherWorktime = 0.99, //NOTE: Intervalo de tiempo en minutos para actualizar el log
       CheckweigherflagRunning = false,
       CheckweigherRejectFlag = false,
       CheckweigherReject,
       CheckweigherVerify = (function(){
         try{
           CheckweigherReject = fs.readFileSync('CheckweigherRejected.json')
           if(CheckweigherReject.toString().indexOf('}') > 0 && CheckweigherReject.toString().indexOf('{\"rejected\":') != -1){
             CheckweigherReject = JSON.parse(CheckweigherReject)
           }else{
             throw 12121212
           }
         }catch(err){
           if(err.code == 'ENOENT' || err == 12121212){
             fs.writeFileSync('CheckweigherRejected.json','{"rejected":0}') //NOTE: Change the object to what it usually is.
             CheckweigherReject = {
               rejected : 0
             }
           }
         }
       })()
var CaseFormerct = null,
    CaseFormerresults = null,
    CntInCaseFormer = null,
    CntOutCaseFormer = null,
    CaseFormeractual = 0,
    CaseFormertime = 0,
    CaseFormersec = 0,
    CaseFormerflagStopped = false,
    CaseFormerstate = 0,
    CaseFormerspeed = 0,
    CaseFormerspeedTemp = 0,
    CaseFormerflagPrint = 0,
    CaseFormersecStop = 0,
    CaseFormerONS = false,
    CaseFormertimeStop = 60, //NOTE: Timestop
    CaseFormerWorktime = 0.99, //NOTE: Intervalo de tiempo en minutos para actualizar el log
    CaseFormerflagRunning = false,
    CaseFormerdeltaRejected= null;
var CasePackerct = null,
    CasePackerresults = null,
    CntInCasePacker = null,
    CntOutCasePacker = null,
    CasePackeractual = 0,
    CasePackertime = 0,
    CasePackersec = 0,
    CasePackerflagStopped = false,
    CasePackerstate = 0,
    CasePackerspeed = 0,
    CasePackerspeedTemp = 0,
    CasePackerflagPrint = 0,
    CasePackersecStop = 0,
    CasePackerONS = false,
    CasePackertimeStop = 60, //NOTE: Timestop
    CasePackerWorktime = 0.99, //NOTE: Intervalo de tiempo en minutos para actualizar el log
    CasePackerflagRunning = false,
    CasePackerdeltaRejected=null;

var CntOutEOL=null,
    secEOL=0;

var int1,int2;



var senderData = function(){
  pubnub.publish(publishConfig, function(status, response) {
                 });
};

var pubnub = new PubNub({
  publishKey : "pub-c-8d024e5b-23bc-4ce8-ab68-b39b00347dfb",
  subscribeKey : "sub-c-c3b3aa54-b44b-11e7-895e-c6a8ff6a3d85",
  uuid : "mespack3-lerma-knorr-1010101"
});

var idle = function(){
  i=0;
  text2send=[];
  for (var k=0;k<files.length;k++){//Verificar los archivos
    var stats = fs.statSync("C:/PULSE/MESPACK3_LOGS/"+files[k]);
    var mtime = new Date(stats.mtime).getTime();
    if (mtime < (Date.now() - (15*60*1000)) && files[k].indexOf("serialbox") == -1){
      text2send[i]=files[k];
      i++;
    }
  }
};


    var client1 = modbus.client.tcp.complete({
      'host': "192.168.10.96",
      'port': 502,
      'autoReconnect': true,
      'timeout': 60000,
      'logEnabled': true,
      'reconnectTimeout' : 30000
    });
    var client2 = modbus.client.tcp.complete({
      'host': "192.168.10.97",
      'port': 502,
      'autoReconnect': true,
      'timeout': 60000,
      'logEnabled': true,
      'reconnectTimeout' : 30000
    });


    client1.connect();
    client2.connect();

function joinWord(num1, num2) {
  var bits = "00000000000000000000000000000000";
  var bin1 = num1.toString(2),
    bin2 = num2.toString(2),
    newNum = bits.split("");

  for (i = 0; i < bin1.length; i++) {
    newNum[31 - i] = bin1[(bin1.length - 1) - i];
  }
  for (i = 0; i < bin2.length; i++) {
    newNum[15 - i] = bin2[(bin2.length - 1) - i];
  }
  bits = newNum.join("");
  return parseInt(bits, 2);
}

client1.on('connect', function(err) {
    int1 = setInterval(function(){


        client1.readHoldingRegisters(0, 16).then(function(resp) {
          PreInFiller = joinWord(resp.register[0], resp.register[1]);
          CntRejFiller =  joinWord(resp.register[2], resp.register[3]);
          CntOutFiller = joinWord(resp.register[4], resp.register[5]);
          CntInXray = CntOutFiller;
          CntOutXray = joinWord(resp.register[6], resp.register[7]);

        //------------------------------------------Filler----------------------------------------------
              Fillerct = CntOutFiller // NOTE: igualar al contador de salida
              if (!FillerONS && Fillerct) {
                FillerspeedTemp = Fillerct
                Fillersec = Date.now()
                FillerONS = true
                Fillertime = Date.now()
              }
              if(Fillerct > Filleractual){
                if(FillerflagStopped){
                  Fillerspeed = Fillerct - FillerspeedTemp
                  FillerspeedTemp = Fillerct
                  Fillersec = Date.now()
                  FillerdeltaRejected = null
                  Fillertime = Date.now()
                }
                FillersecStop = 0
                Fillerstate = 1
                FillerflagStopped = false
                FillerflagRunning = true
              } else if( Fillerct == Filleractual ){
                if(FillersecStop == 0){
                  Fillertime = Date.now()
                  FillersecStop = Date.now()
                }
                if( ( Date.now() - ( FillertimeStop * 1000 ) ) >= FillersecStop ){
                  Fillerspeed = 0
                  Fillerstate = 2
                  FillerspeedTemp = Fillerct
                  FillerflagStopped = true
                  FillerflagRunning = false
                  FillerflagPrint = 1
                }
              }
              Filleractual = Fillerct
              if(Date.now() - 60000 * FillerWorktime >= Fillersec && FillersecStop == 0){
                if(FillerflagRunning && Fillerct){
                  FillerflagPrint = 1
                  FillersecStop = 0
                  Fillerspeed = Fillerct - FillerspeedTemp
                  FillerspeedTemp = Fillerct
                  Fillersec = Date.now()
                }
              }
              Fillerresults = {
                ST: Fillerstate,
                CPQI: CntOutFiller + CntRejFiller,
                CPQO: CntOutFiller,
                CPQR : CntRejFiller,
                SP: Fillerspeed
              }
              if (FillerflagPrint == 1) {
                for (var key in Fillerresults) {
                  if( Fillerresults[key] != null && ! isNaN(Fillerresults[key]) )
                  //NOTE: Cambiar path
                  fs.appendFileSync('C:/PULSE/MESPACK3_LOGS/mex_ler_Filler_mespack3.log', 'tt=' + Fillertime + ',var=' + key + ',val=' + Fillerresults[key] + '\n')
                }
                FillerflagPrint = 0
                FillersecStop = 0
                Fillertime = Date.now()
              }
        //------------------------------------------Filler----------------------------------------------
        //------------------------------------------Xray----------------------------------------------
              Xrayct = CntOutXray // NOTE: igualar al contador de salida
              if (!XrayONS && Xrayct) {
                XrayspeedTemp = Xrayct
                Xraysec = Date.now()
                XrayONS = true
                Xraytime = Date.now()
              }
              if(Xrayct > Xrayactual){
                if(XrayflagStopped){
                  Xrayspeed = Xrayct - XrayspeedTemp
                  XrayspeedTemp = Xrayct
                  Xraysec = Date.now()
                  XraydeltaRejected = null
                  XrayRejectFlag = false
                  Xraytime = Date.now()
                }
                XraysecStop = 0
                Xraystate = 1
                XrayflagStopped = false
                XrayflagRunning = true
              } else if( Xrayct == Xrayactual ){
                if(XraysecStop == 0){
                  Xraytime = Date.now()
                  XraysecStop = Date.now()
                }
                if( ( Date.now() - ( XraytimeStop * 1000 ) ) >= XraysecStop ){
                  Xrayspeed = 0
                  Xraystate = 2
                  XrayspeedTemp = Xrayct
                  XrayflagStopped = true
                  XrayflagRunning = false
                  if(CntInXray - CntOutXray - XrayReject.rejected != 0 && ! XrayRejectFlag){
                    XraydeltaRejected = CntInXray - CntOutXray - XrayReject.rejected
                    XrayReject.rejected = CntInXray - CntOutXray
                    fs.writeFileSync('XrayRejected.json','{"rejected": ' + XrayReject.rejected + '}')
                    XrayRejectFlag = true
                  }else{
                    XraydeltaRejected = null
                  }
                  XrayflagPrint = 1
                }
              }
              Xrayactual = Xrayct
              if(Date.now() - 60000 * XrayWorktime >= Xraysec && XraysecStop == 0){
                if(XrayflagRunning && Xrayct){
                  XrayflagPrint = 1
                  XraysecStop = 0
                  Xrayspeed = Xrayct - XrayspeedTemp
                  XrayspeedTemp = Xrayct
                  Xraysec = Date.now()
                }
              }
              Xrayresults = {
                ST: Xraystate,
                CPQI : CntInXray,
                CPQO : CntOutXray,
                CPQR : XraydeltaRejected,
                SP: Xrayspeed
              }
              if (XrayflagPrint == 1) {
                for (var key in Xrayresults) {
                  if( Xrayresults[key] != null && ! isNaN(Xrayresults[key]) )
                  //NOTE: Cambiar path
                  fs.appendFileSync('C:/PULSE/MESPACK3_LOGS/mex_ler_Xray_mespack3.log', 'tt=' + Xraytime + ',var=' + key + ',val=' + Xrayresults[key] + '\n')
                }
                XrayflagPrint = 0
                XraysecStop = 0
                Xraytime = Date.now()
              }
        //------------------------------------------Xray----------------------------------------------
        });//Cierre de lectura

      },1000);
  });//Cierre de cliente

      client1.on('error', function(err) {
        clearInterval(int1);
      });
      client1.on('close', function() {
        clearInterval(int1);
      });


      client2.on('connect', function(err) {
      int2 = setInterval(function(){

      client2.readHoldingRegisters(0, 16).then(function(resp) {

        CntInCaseFormer = joinWord(resp.register[0], resp.register[1]);
        CntInCasePacker = joinWord(resp.register[2], resp.register[3]);
        CntOutCasePacker = joinWord(resp.register[4], resp.register[5]);
        CntOutCaseFormer = joinWord(resp.register[6], resp.register[7]);
        CntOutEOL = joinWord(resp.register[8], resp.register[9]);
        CntInCheckweigher = CntOutXray;
        CntOutCheckweigher = CntInCasePacker;
        //------------------------------------------Checkweigher----------------------------------------------
              Checkweigherct = CntOutCheckweigher // NOTE: igualar al contador de salida
              if (!CheckweigherONS && Checkweigherct) {
                CheckweigherspeedTemp = Checkweigherct
                Checkweighersec = Date.now()
                CheckweigherONS = true
                Checkweighertime = Date.now()
              }
              if(Checkweigherct > Checkweigheractual){
                if(CheckweigherflagStopped){
                  Checkweigherspeed = Checkweigherct - CheckweigherspeedTemp
                  CheckweigherspeedTemp = Checkweigherct
                  Checkweighersec = Date.now()
                  CheckweigherdeltaRejected = null
                  CheckweigherRejectFlag = false
                  Checkweighertime = Date.now()
                }
                CheckweighersecStop = 0
                Checkweigherstate = 1
                CheckweigherflagStopped = false
                CheckweigherflagRunning = true
              } else if( Checkweigherct == Checkweigheractual ){
                if(CheckweighersecStop == 0){
                  Checkweighertime = Date.now()
                  CheckweighersecStop = Date.now()
                }
                if( ( Date.now() - ( CheckweighertimeStop * 1000 ) ) >= CheckweighersecStop ){
                  Checkweigherspeed = 0
                  Checkweigherstate = 2
                  CheckweigherspeedTemp = Checkweigherct
                  CheckweigherflagStopped = true
                  CheckweigherflagRunning = false
                  if(CntInCheckweigher - CntOutCheckweigher - CheckweigherReject.rejected != 0 && ! CheckweigherRejectFlag){
                    CheckweigherdeltaRejected = CntInCheckweigher - CntOutCheckweigher - CheckweigherReject.rejected
                    CheckweigherReject.rejected = CntInCheckweigher - CntOutCheckweigher
                    fs.writeFileSync('CheckweigherRejected.json','{"rejected": ' + CheckweigherReject.rejected + '}')
                    CheckweigherRejectFlag = true
                  }else{
                    CheckweigherdeltaRejected = null
                  }
                  CheckweigherflagPrint = 1
                }
              }
              Checkweigheractual = Checkweigherct
              if(Date.now() - 60000 * CheckweigherWorktime >= Checkweighersec && CheckweighersecStop == 0){
                if(CheckweigherflagRunning && Checkweigherct){
                  CheckweigherflagPrint = 1
                  CheckweighersecStop = 0
                  Checkweigherspeed = Checkweigherct - CheckweigherspeedTemp
                  CheckweigherspeedTemp = Checkweigherct
                  Checkweighersec = Date.now()
                }
              }
              Checkweigherresults = {
                ST: Checkweigherstate,
                CPQI : CntInCheckweigher,
                CPQO : CntOutCheckweigher,
                CPQR : CheckweigherdeltaRejected,
                SP: Checkweigherspeed
              }
              if (CheckweigherflagPrint == 1) {
                for (var key in Checkweigherresults) {
                  if( Checkweigherresults[key] != null && ! isNaN(Checkweigherresults[key]) )
                  //NOTE: Cambiar path
                  fs.appendFileSync('C:/PULSE/MESPACK3_LOGS/mex_ler_Checkweigher_mespack3.log', 'tt=' + Checkweighertime + ',var=' + key + ',val=' + Checkweigherresults[key] + '\n')
                }
                CheckweigherflagPrint = 0
                CheckweighersecStop = 0
                Checkweighertime = Date.now()
              }
        //------------------------------------------Checkweigher----------------------------------------------
        //------------------------------------------CaseFormer----------------------------------------------
              CaseFormerct = CntOutCaseFormer // NOTE: igualar al contador de salida
              if (!CaseFormerONS && CaseFormerct) {
                CaseFormerspeedTemp = CaseFormerct
                CaseFormersec = Date.now()
                CaseFormerONS = true
                CaseFormertime = Date.now()
              }
              if(CaseFormerct > CaseFormeractual){
                if(CaseFormerflagStopped){
                  CaseFormerspeed = CaseFormerct - CaseFormerspeedTemp
                  CaseFormerspeedTemp = CaseFormerct
                  CaseFormersec = Date.now()
                  CaseFormerdeltaRejected = null
                  CaseFormertime = Date.now()
                }
                CaseFormersecStop = 0
                CaseFormerstate = 1
                CaseFormerflagStopped = false
                CaseFormerflagRunning = true
              } else if( CaseFormerct == CaseFormeractual ){
                if(CaseFormersecStop == 0){
                  CaseFormertime = Date.now()
                  CaseFormersecStop = Date.now()
                }
                if( ( Date.now() - ( CaseFormertimeStop * 1000 ) ) >= CaseFormersecStop ){
                  CaseFormerspeed = 0
                  CaseFormerstate = 2
                  CaseFormerspeedTemp = CaseFormerct
                  CaseFormerflagStopped = true
                  CaseFormerflagRunning = false
                  CaseFormerflagPrint = 1
                }
              }
              CaseFormeractual = CaseFormerct
              if(Date.now() - 60000 * CaseFormerWorktime >= CaseFormersec && CaseFormersecStop == 0){
                if(CaseFormerflagRunning && CaseFormerct){
                  CaseFormerflagPrint = 1
                  CaseFormersecStop = 0
                  CaseFormerspeed = CaseFormerct - CaseFormerspeedTemp
                  CaseFormerspeedTemp = CaseFormerct
                  CaseFormersec = Date.now()
                }
              }
              CaseFormerresults = {
                ST: CaseFormerstate,
                CPQICARTON: CntInCaseFormer,
                CPQO: CntOutCaseFormer,
                SP: CaseFormerspeed
              }
              if (CaseFormerflagPrint == 1) {
                for (var key in CaseFormerresults) {
                  if( CaseFormerresults[key] != null && ! isNaN(CaseFormerresults[key]) )
                  //NOTE: Cambiar path
                  fs.appendFileSync('C:/PULSE/MESPACK3_LOGS/mex_ler_CaseFormer_mespack3.log', 'tt=' + CaseFormertime + ',var=' + key + ',val=' + CaseFormerresults[key] + '\n')
                }
                CaseFormerflagPrint = 0
                CaseFormersecStop = 0
                CaseFormertime = Date.now()
              }
        //------------------------------------------CaseFormer----------------------------------------------
        //------------------------------------------CasePacker----------------------------------------------
              CasePackerct = CntOutCasePacker // NOTE: igualar al contador de salida
              if (!CasePackerONS && CasePackerct) {
                CasePackerspeedTemp = CasePackerct
                CasePackersec = Date.now()
                CasePackerONS = true
                CasePackertime = Date.now()
              }
              if(CasePackerct > CasePackeractual){
                if(CasePackerflagStopped){
                  CasePackerspeed = CasePackerct - CasePackerspeedTemp
                  CasePackerspeedTemp = CasePackerct
                  CasePackersec = Date.now()
                  CasePackerdeltaRejected = null
                  CasePackertime = Date.now()
                }
                CasePackersecStop = 0
                CasePackerstate = 1
                CasePackerflagStopped = false
                CasePackerflagRunning = true
              } else if( CasePackerct == CasePackeractual ){
                if(CasePackersecStop == 0){
                  CasePackertime = Date.now()
                  CasePackersecStop = Date.now()
                }
                if( ( Date.now() - ( CasePackertimeStop * 1000 ) ) >= CasePackersecStop ){
                  CasePackerspeed = 0
                  CasePackerstate = 2
                  CasePackerspeedTemp = CasePackerct
                  CasePackerflagStopped = true
                  CasePackerflagRunning = false
                  CasePackerflagPrint = 1
                }
              }
              CasePackeractual = CasePackerct
              if(Date.now() - 60000 * CasePackerWorktime >= CasePackersec && CasePackersecStop == 0){
                if(CasePackerflagRunning && CasePackerct){
                  CasePackerflagPrint = 1
                  CasePackersecStop = 0
                  CasePackerspeed = CasePackerct - CasePackerspeedTemp
                  CasePackerspeedTemp = CasePackerct
                  CasePackersec = Date.now()
                }
              }
              CasePackerresults = {
                ST: CasePackerstate,
                CPQIBAG: CntInCasePacker,
                CPQICARTON: CntOutCaseFormer,
                CPQO: CntOutCasePacker,
                SP: CasePackerspeed
              }
              if (CasePackerflagPrint == 1) {
                for (var key in CasePackerresults) {
                  if( CasePackerresults[key] != null && ! isNaN(CasePackerresults[key]) )
                  //NOTE: Cambiar path
                  fs.appendFileSync('C:/PULSE/MESPACK3_LOGS/mex_ler_CasePacker_mespack3.log', 'tt=' + CasePackertime + ',var=' + key + ',val=' + CasePackerresults[key] + '\n')
                }
                CasePackerflagPrint = 0
                CasePackersecStop = 0
                CasePackertime = Date.now()
              }
        //------------------------------------------CasePacker----------------------------------------------
        //------------------------------------------EOL----------------------------------------------
              if(secEOL>=60 && CntOutEOL){
                fs.appendFileSync("C:/PULSE/MESPACK3_LOGS/mex_ler_EOL_mespack3.log","tt="+Date.now()+",var=EOL"+",val="+CntOutEOL+"\n");
                secEOL=0;
              }else{
                secEOL++;
              }
        //------------------------------------------EOL----------------------------------------------
      });//Cierre de lectura

      },1000);
      });//Cierre de cliente

      client2.on('error', function(err) {
        clearInterval(int2);
      });
      client2.on('close', function() {
        clearInterval(int2);
      });


  //------------------------------------------Pubnub----------------------------------------------
  setInterval(function(){


      if(secPubNub>=60*5){
          secPubNub=0;
          idle();
          publishConfig = {
            channel : "Lerma_Monitor",
            message : {
                  line: "Mespack3",
                  tt: Date.now(),
                  machines: text2send
                }
          };
          senderData();
        }else{
          secPubNub++;
        }
      },1000);

  //------------------------------------------Pubnub----------------------------------------------


}catch(err){
    fs.appendFileSync("error.log",err + '\n');
}
