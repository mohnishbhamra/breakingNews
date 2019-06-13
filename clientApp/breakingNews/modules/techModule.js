/* File to handle CRUD operations on technology table*/

//sample create function
function techCreate() {
    var obj = new kony.sdk.KNYObj("technolgy_news");
    var record = {};
    record.techid = 1;
    record.stateid = 1;
    record.date = "2019-06-12";
    record.image1 = "some";
    obj.create(record, {}, successCallback, failureCallback);
}