/* File to handle CRUD operations on technology table*/

//sample create function
function techCreate() {
    var obj = new kony.sdk.KNYObj("technolgy_news");
    var record = {};
    record.techid = 1;
    record.stateId = 1;
    record.Date = "2019-06-12";
    record.image1 = base64String;
    obj.create(record, {}, successCallback, failureCallback);
}