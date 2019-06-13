var base64Global;
var appKey = "276cd5d9697082c509240e05ced84e8d";
var appSecret = "5bb54d20c2afe4b8c23b7bea1af656dd";
var serviceUrl = "http://KH2321.kitspl.com:8443/authService/100000002/appconfig";
var client = null;
var stateNewsRecords = [];
var currentNewsObject = null;
var stateNewsListBoxMasterData;
var currentNews = [];

function getFileObject() {
    var config = {
        selectMultipleFiles: false,
        filter: ["image/png", "image/jpeg", "image/jpg"]
    };
    kony.io.FileSystem.browse(config, function (res, file) {
        fileObject = file[0].file;
        getBase64FromBlob(fileObject, function (base64Str) {
            base64Global = base64Str;
          	Form1.imgWidget.base64 = base64Global;
        });
    });
}

getBase64FromBlob = function (blobObj, callback) {
    var reader = new FileReader();
    reader.readAsDataURL(blobObj);
    reader.onloadend = function () {
        var dataUrl = reader.result;
        var base64Data = dataUrl.split(',')[1];
        callback(base64Data);
    };
};

function sdkInit() {
  kony.print("init sdk");
  function initSuccess(result) {
    kony.print("init success " + JSON.stringify(result));
    alert("init success " + JSON.stringify(result));
    setup();
  }
  
  function initFailure(err) {
    kony.print("init failure " + JSON.stringify(err));
    alert("init failure " + JSON.stringify(err));    
  }
  
  client = new kony.sdk();
  client.init(appKey, appSecret, serviceUrl, initSuccess, initFailure);
}


function setup() {
  kony.print("setup");
  
  function setupSucccess(result) {
    kony.print("setup success " + JSON.stringify(result));
    alert("setup success " + JSON.stringify(result));
    syncStateNews();
  }
  
  function setupFailure(err) {
    kony.print("setup failed " + JSON.stringify(err));
    alert("setup failed " + JSON.stringify(err));
  }
  
  var options = {};
  KNYMobileFabric.OfflineObjects.setup(options, setupSucccess, setupFailure);
}

function syncStateNews() {
  var objectName = "state_news";
  kony.print("syncing " + objectName);
  var sdkObject = new kony.sdk.KNYObj(objectName);
  
  function syncStateNewsSuccess(result) {
  	kony.print(objectName + " sync success " + JSON.stringify(result));
    alert(objectName + " sync success " + JSON.stringify(result));
	fetchStateNews();
  }
  
  function syncStateNewsFailure(err) {
    kony.print(objectName + " sync failed " + JSON.stringify(err));
    alert(objectName + " sync failed " + JSON.stringify(err));
  }
  
  function syncStateNewsProgress() {
    
  }
  
  sdkObject.startSync({}, syncStateNewsSuccess, syncStateNewsFailure, syncStateNewsProgress);
}

function fetchStateNews() {
  var objectName = "state_news";  
  kony.print("fetching " + objectName + " records");
  var sdkObject = new kony.sdk.KNYObj(objectName);
  var options = {};
  var orderByMap = [];
  orderByMap.push({"stateName":"ASC"});
  options.orderByMap = orderByMap;
  
  function getStateNewsSuccess(records) {
  	kony.print(objectName + " fetch success " + JSON.stringify(records));
    alert(objectName + " fetch success " + JSON.stringify(records));    
    stateNewsRecords = records;
    loadStateNewsDropDown();
  }
  
  function getStateNewsFailure(err) {
    kony.print(objectName + " fetch failed " + JSON.stringify(err));
    alert(objectName + " fetch failed " + JSON.stringify(err));    
  }
  
  sdkObject.get(options, getStateNewsSuccess, getStateNewsFailure);
}

function loadStateNewsDropDown() {
  stateNewsListBoxMasterData = [];  
  for(var i=0; i < stateNewsRecords.length; i++) {
    var keyValuePair = [];
    if( stateNewsRecords[i] !== null && typeof(stateNewsRecords[i]) != 'undefined') {
      keyValuePair[0] = stateNewsRecords[i].stateId;
      keyValuePair[1] = stateNewsRecords[i].stateName;
      stateNewsListBoxMasterData.push(keyValuePair);
    }
  }
  
  frmWelcome.lstBoxState.masterData = stateNewsListBoxMasterData;
}


function getNews() {
  var newsType = frmWelcome.lstBoxNewsType.selectedKeyValue[1];
  alert("news type " + newsType);
  var objectName = "";
  function syncSuccessCallback() {
    kony.print(objectName + " sync success ");
    alert(objectName + " sync success ");
    getCurrentNews();
  }
  
  function syncFailureCallback(err) {
    kony.print(objectName + " sync failure " + JSON.stringify(err));
    alert(objectName + " sync failure " + JSON.stringify(err));    
  }
  
  function syncProgressCallback() {
    
  }
  
  if(newsType !== null) {
    objectName = newsType + "_news";
    currentNewsObject = objectName;
    var sdkObject = new kony.sdk.KNYObj(objectName);
    var filter = frmWelcome.calBtn.day + "/" + frmWelcome.calBtn.month + "/" + frmWelcome.calBtn.year;
    var syncConfig = {};
    syncConfig.syncType = "downloadOnly";
    //TODO: Have to use filter
    //syncConfig.filter = "Date eq " + filter;
    sdkObject.startSync(syncConfig, syncSuccessCallback, syncFailureCallback, syncProgressCallback);
  }
}

function getCurrentNews() {
  kony.print("fetching current news");
  alert("fetching current news");
  function getCurrentNewsSuccess(records) {
    kony.print(currentNewsObject + " fetch success " + JSON.stringify(records));
    alert(currentNewsObject + " fetch success " + JSON.stringify(records));
    currentNews = records;
    frmNews.show();
  }
  
  function getCurrentNewsFailure(err) {
    kony.print(currentNewsObject + " fetch failure " + JSON.stringify(err));
    alert(currentNewsObject + " fetch failure " + JSON.stringify(err));       
  }
  
  if(currentNewsObject !== null) {
    var sdkObject = new kony.sdk.KNYObj(currentNewsObject);
  	var options = {};
  	var orderByMap = [];
  	orderByMap.push({"Date":"ASC"});
  	options.orderByMap = orderByMap;
  	sdkObject.get(options, getCurrentNewsSuccess, getCurrentNewsFailure);    
  }
}

function populateCurrentNews() {
  kony.print("populateCurrentNews");
  alert("populateCurrentNews");
  var segmentData = [];
  for(var i=0; i<currentNews.length; i++) {
    var rowData = {};
    rowData.lblTitle = currentNews[i].title;
    rowData.lblDescription = currentNews[i].description;
    var crawBytes = kony.convertToRawBytes(currentNews[i].image1);
    rowData.imgNews = {"rawBytes":crawBytes};
    segmentData.push(rowData);
  }
  frmNews.segNews.setData(segmentData);  
}

function syncAll(){
  var syncOptions = {};
  KNYMobileFabric.OfflineObjects.startSync(syncOptions, successCallback, failureCallback);
}