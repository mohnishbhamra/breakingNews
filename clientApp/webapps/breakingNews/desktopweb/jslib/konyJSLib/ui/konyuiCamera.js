
kony.ui.Camera = function(bconfig, lconfig, pspconfig) {
	if(arguments.length < 3)
		bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("Camera"));

	kony.ui.Camera.baseConstructor.call(this, bconfig, lconfig, pspconfig);
	this.wType = "Camera";
	this.videoduration = bconfig.videoDuration;
	this.rawbytes = "";

	defineGetter(this, "rawBytes", function() {
	    return this.rawbytes;
	});

	defineSetter(this, "rawBytes", function(val) {});

	defineGetter(this, "videoDuration", function() {
	    return this.videoduration;
	});

	defineSetter(this, "videoDuration", function(val) {
	    this.videoduration = val;
	});

	this._poster = pspconfig.poster;

	defineGetter(this, "poster", function() {
		return this._poster;
	});
	defineSetter(this, "poster", function(val) {
		this._poster = val;
	    $KW[this.wType]["updateView"](this, "poster", val);
	});

	this.camerasource = pspconfig.cameraSource;

	defineGetter(this, "cameraSource", function() {
		return this.camerasource;
	});

	defineSetter(this, "cameraSource", function(val) {
	    this.camerasource = val;
	});

	this.oncapture = bconfig.onCapture;

	defineGetter(this, "onCapture", function() {
        return this.oncapture;
    });

    defineSetter(this, "onCapture", function(val) {
        this.oncapture = val;
    });

    this.oncapturefailed = bconfig.onCaptureFailed;

    defineGetter(this, "onCaptureFailed", function() {
        return this.oncapturefailed;
    });

    defineSetter(this, "onCaptureFailed", function(val) {
        this.oncapturefailed = val;
    });

    this.onfailure = bconfig.onFailure;

    defineGetter(this, "onFailure", function() {
        return this.onfailure;
    });

    defineSetter(this, "onFailure", function(val) {
        this.onfailure = val;
    });


};

kony.inherits(kony.ui.Camera, kony.ui.Widget);

kony.ui.Camera.prototype.startVideoCapture = function(config) {
	$KW.Camera.startVideoCapture(this, config);
};

kony.ui.Camera.prototype.stopVideoCapture = function(config) {
	$KW.Camera.stopVideoCapture(this, config);
};

kony.ui.Camera.prototype.takePicture = function() {
	 $KW.Camera.takePicture(this);
};

kony.ui.Camera.prototype.openCamera = function() {
	$KW.Camera.openCamera(this);
};

kony.ui.Camera.prototype.closeCamera = function() {
	$KW.Camera.closeCamera(this);
};