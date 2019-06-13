/* File to handle CRUD operations on technology table*/

var globalDate = "";
var selectedObjectName = "";
var selectedStateKey ;
//sample create function
function newsCreate() {
    var obj = new kony.sdk.KNYObj(selectedObjectName);
    var record = {};
    record.techid = Number(FormSubNewsCreate.txtNewsID.text);
    record.stateId = selectedStateKey;
    record.title = FormSubNewsCreate.txtTextBox.text;
    record.description = FormSubNewsCreate.txtDetailsNews.text;
    record.Date = "2019-06-12";
    record.image1 = gloablImagesSet[0];
    record.image2 = gloablImagesSet[1];
    record.image3 = gloablImagesSet[2];
    obj.create(record, {}, successCallback, failureCallback);
}

var gloablImagesSet = [];
function getImages() {
    var config = {
        selectMultipleFiles: true,
        filter: ["image/png", "image/jpeg", "image/jpg"]
    };
    kony.io.FileSystem.browse(config, async function (res, file) {
        gloablImagesSet = [];
        for (var pos = 0; pos < file.length; pos++) {
            fileObject = file[pos].file;
            result = await readFileAsDataURL(fileObject);
            var base64data = result.split(',')[1];
            gloablImagesSet.push(base64data);
        }
    });
}

async function readFileAsDataURL(file) {
    let result_base64 = await new Promise((resolve) => {
        let fileReader = new FileReader();
        fileReader.onload = (e) => resolve(fileReader.result);
        fileReader.readAsDataURL(file);
    });
 return result_base64;
}


function getCurrentDate(eventobject , isValidDateSelected){
    var regex = new RegExp("/", 'g');
    var date = eventobject.date;
    globalDate = date.replace(regex,"-");
}