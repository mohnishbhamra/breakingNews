function successCallback(obj) {
    var msg = "success" + JSON.stringify(obj);
    alert(msg);
    kony.print(msg);
}

function failureCallback(err) {
    var msg = "failed" + JSON.stringify(err);
    alert(msg);
    kony.print(msg);
}
