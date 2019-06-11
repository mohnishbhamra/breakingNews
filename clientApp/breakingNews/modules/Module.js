var base64Global;

function getFileObject() {
    var config = {
        selectMultipleFiles: false,
        filter: ["image/png", "image/jpeg", "image/jpg"]
    };
    kony.io.FileSystem.browse(config, function (res, file) {
        fileObject = file[0].file;
        getBase64FromBlob(fileObject, function (base64Str) {
            base64Global = base64Str;
          	Form1.imgWidget.rawBytes = base64Global;
        });
        uploadBinary();
    });
}

getBase64FromBlob = function (blobObj, callback) {
    // blobObj = blobObj.BlobObject;
    var reader = new FileReader();
    reader.readAsDataURL(blobObj);
    reader.onloadend = function () {
        var dataUrl = reader.result;
        var base64Data = dataUrl.split(',')[1];
        callback(base64Data);
    }
};