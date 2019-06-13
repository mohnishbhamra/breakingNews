$KI.push = (function() {
    var module = {};
    var onsuccessfulregistration, onfailureregistration;
    var onlinenotification, offlinenotification;
    var onsuccessfulderegistration, onfailurederegistration;
    var messaging;

    (function(){
        var pusInterval = setInterval(function() {
            if(kony.isformRenderd) {
                clearInterval(pusInterval);
                var config = localStorage.getItem($KG["appid"] + "_" + "pushConfig");
                if(config) {
                    config = JSON.parse(config);
                    if(!messaging) {
                        firebase.initializeApp(config);
                        messaging = firebase.messaging();
                        messaging.usePublicVapidKey(config.publicKey);
                    }
                    messaging.onMessage(function(payload) {
                        kony.web.logger("log", 'Push notification received data is '+ JSON.stringify(payload));
                        onlinenotification && onlinenotification(payload);
                    });
                }
            }
        }, 1000);
    })();

    
    
    module.setCallbacks = function(data) {
        $KU.logExecuting('kony.push.setCallbacks');
        $KU.logExecutingWithParams('kony.push.setCallbacks', data);
        onsuccessfulregistration  = data.onsuccessfulregistration;
        onfailureregistration = data.onfailureregistration;
        onlinenotification = data.onlinenotification;
        offlinenotification = data.offlinenotification;
        onsuccessfulderegistration = data.onsuccessfulderegistration;
        onfailurederegistration = data.onfailurederegistration;
        $KU.logExecutingFinished('kony.push.setCallbacks');
    };

    module.register = function (config) {
        $KU.logExecuting('kony.push.register');
        if (!firebase.messaging.isSupported()) {
            $KU.logWarnMessage('Browser does not have the Push Notifications');
            return;
        }
        if(!messaging) {
            $KU.logExecutingWithParams('kony.push.register', config);
            firebase.initializeApp(config);
            messaging = firebase.messaging();
            messaging.usePublicVapidKey(config.publicKey);
            __getPermission(config);
            $KU.logExecutingFinished('kony.push.register');
        }
    };

    function __getPermission(config) {
        messaging.requestPermission().then(function() {
            kony.web.logger("log", 'Notification permission granted.');
            
            if(konySwRegistration) {
                kony.web.logger("log", 'Service worker registration succeeded.');
                messaging.useServiceWorker(konySwRegistration);
                localStorage.setItem($KG["appid"] + "_" + "pushConfig", JSON.stringify(config));
                __getToken(messaging);
            } else {
                kony.web.logger("log", "Service worker registration failed:"+ error);
                onfailureregistration && onfailureregistration({"errorCode": "1406",
                                                                "errormessage": "Service worker registration failed"});
            }
         }).catch(function(err) {
            kony.web.logger("log", "Unable to get permission to notify."+ err);
            onfailureregistration && onfailureregistration({"errorCode": "1403",
                                                            "errormessage": "permission is not available"});
        });
    }


    function __getToken(messaging) {
        messaging.getToken().then(function(token) {
            if(token) {
                localStorage.setItem($KG["appid"] + "_" + "pushId", token);
                kony.web.logger("log", "token is "+ token);
                messaging.onMessage(function(payload) {
                    kony.web.logger("log", 'Push notification received. Data is '+ JSON.stringify(payload));
                    onlinenotification && onlinenotification(payload);
                });
                onsuccessfulregistration(token);
            } else {
                kony.web.logger("log", "No Instance ID token available. Request permission to generate one.");
                onfailureregistration && onfailureregistration({"errorCode": "1403",
                                                                "errormessage": "Unknown Error"});
            }
        }).catch(function(err) {
            kony.web.logger("log", "An error occurred while retrieving token. "+ err);
            onfailureregistration && onfailureregistration({"errorCode": "1402",
                                                            "errormessage": "PNS token is not available"});

        })
    }

   module.deregister = function() {
        $KU.logExecuting('kony.push.deRegister');
        var config = localStorage.getItem($KG["appid"] + "_" + "pushConfig");
        config =  JSON.parse(config);
        var token =localStorage.getItem($KG["appid"] + "_" + "pushId");

        if(config && token) {
            $KU.logExecutingWithParams('kony.push.deRegister');
            messaging.deleteToken(token).then(function() {
                kony.web.logger("log", "succssfully unregistered from FCM.");
                onsuccessfulderegistration && onsuccessfulderegistration();
                localStorage.removeItem($KG["appid"] + "_" + "pushId");
                localStorage.removeItem($KG["appid"] + "_" + "pushConfig");
            }).catch(function(err) {
                $KU.logErrorMessage("unable to unregister from FCM."+ JSON.stringify(err));
                onfailurederegistration && onfailurederegistration();
            })
        } else {
            $KU.logWarnMessage('User is not subscribed for FCM');
        }
        $KU.logExecutingFinished('kony.push.deRegister');
    };

    return module;
}());

$KI.HoverInit = function(widgetModel) {
    var node = this.node = $KU.getNodeByModel(widgetModel);
    if(node) {
        var nodeList = document.querySelectorAll("#" + node.id);
        for(var i = 0; i < nodeList.length; i++) {
            nodeList[i].onmouseenter = nodeList[i].onmousemove = nodeList[i].onmouseout = this.eventListener.bind(this);
        }
    }
};

$KI.HoverInit.prototype = {
    eventListener: function(event) {
        $KI.HoverEvent.executeHoverEvent(event, this.node);
    }
};

$KI.HoverEvent = {
    mouseOut: function(target, totg) {
        if(target == totg) return false;
        var node = totg;
        while(node) {
            node = node.parentNode;
            if(node == target) return false;
        }
        return true;
    },

    mouseIn: function(target, fromtg, totg) {

        if(target.contains(fromtg))
            return false;
        else
            return true;
    },

    executeHoverEvent: function(event, node) {
        var event = event || window.event;
        var target = event.currentTarget || node;
        if(!target) return;

        var widgetModel = $KU.getModelByNode(target),
            containerId = target.getAttribute("kcontainerID");
        if(!widgetModel) return;

        if(containerId) {
            var containerNode = $KU.getParentByAttributeValue(target, "kwidgettype", "Segment");
            if(!containerNode) {
                containerNode = $KU.getParentByAttributeValue(target, "kwidgettype", "DataGrid");
            }
            if(!containerNode) {
                
                kony.events.removeEventListener(target, 'mouseenter');
                kony.events.removeEventListener(target, 'mousemove');
                kony.events.removeEventListener(target, 'mouseout');
                return;
            }
        }

        var totg = (event.toElement) ? event.toElement : event.toElement;
        var fromtg = (event.fromElement) ? event.fromElement : event.fromElement;

        if(event.type == "mousemove" || (event.type == "mouseenter" && $KI.HoverEvent.mouseIn(target, fromtg, totg)) ||
            (event.type == "mouseout" && $KI.HoverEvent.mouseOut(target, totg))) {
            

            var context = {};
            context.event = event.type;
            if(event.type === "mouseenter") {
                context.eventType = 0;
            } else if(event.type === "mousemove") {
                context.eventType = 1;
            } else if(event.type === "mouseout") {
                context.eventType = 2;
            }
            context.pageX = event.pageX || event.clientX;
            context.pageY = event.pageY || event.clientY;
            context.screenX = event.clientX || null;
            context.screenY = event.clientY || null;

            if(containerId) {
                var containerModel = $KW.Utils.getContainerModelById(target, containerId);
                if(!containerModel)
                    return;
                var eventReference = $KU.returnEventReference(widgetModel.onhover);

                if(containerModel.wType == "DataGrid") {
                    var indexNode = $KU.getParentByAttribute(target, "colindex");
                    var headerNode = $KU.getParentByAttribute(target, "index");
                    if(headerNode && headerNode.getAttribute("index")) {
                        if(parseInt(headerNode.getAttribute("index")) == 0) {
                            context.rowIndex = -1;
                        } else {
                            context.rowIndex = parseInt(indexNode.getAttribute("colindex").split(",")[0]);
                        }
                        context.columnIndex = parseInt(indexNode.getAttribute("colindex").split(",")[1]);
                    }

                    
                    var colheadInfo = containerModel.columnids[context.columnIndex];
                    var coldata = context.rowIndex == -1 ? containerModel.columnHeadersConfig[context.columnIndex] : containerModel.data[context.rowIndex][colheadInfo];
                    var widgetData = context.rowIndex == -1 ? coldata.columnheadertemplate.data : (containerModel.widgetdatamap ? coldata[containerModel.widgetdatamap[widgetModel.id]] : coldata[widgetModel.id]);
                    
                    if(widgetData && widgetData.onHover) {
                        eventReference = widgetData.onHover;
                    }

                } else if(containerModel.wType == "Segment") {
                    if(containerModel.viewtype == "pageview") {
                        var parentIndexNode = $KU.getParentByAttribute(target, "index");
                        context.sectionIndex = 0;
                        context.rowIndex = parentIndexNode.getAttribute("index");
                    } else {
                        var parentIndexNode = $KU.getParentByTagName(target, 'li');
                        if(parentIndexNode.getAttribute("secindex")) {
                            context.sectionIndex = parentIndexNode.getAttribute("secindex") ? parseInt(parentIndexNode.getAttribute("secindex").split(",")[0]) : "";
                            context.rowIndex = parentIndexNode.getAttribute("secindex") ? parseInt(parentIndexNode.getAttribute("secindex").split(",")[1]) : "";
                        } else if(parentIndexNode.getAttribute("index")) {
                            context.sectionIndex = 0;
                            context.rowIndex = parentIndexNode.getAttribute("index") ? parseInt(parentIndexNode.getAttribute("index").split(",")[0]) : "";
                        }
                        if((containerModel.selectionbehavior == constants.SEGUI_SINGLE_SELECT_BEHAVIOR) || (containerModel.selectionbehavior == constants.SEGUI_MULTI_SELECT_BEHAVIOR)) {
                            context.selectionState = false;
                            var selectedIndices = containerModel.selectedIndices;
                            if(selectedIndices) {
                                for(var i = 0; i < selectedIndices.length; i++) {
                                    if(context.sectionIndex == selectedIndices[i][0]) {
                                        var selectedRowArray = selectedIndices[i][1];
                                        for(var j = 0; j < selectedRowArray.length; j++) {
                                            if(context.rowIndex == selectedRowArray[j])
                                                context.selectionState = true;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    
                    var rowdata = containerModel.hasSections ? (context.rowIndex == -1 ? containerModel.data[context.sectionIndex][IndexJL + 0] : containerModel.data[context.sectionIndex][IndexJL + 1][context.rowIndex]) : containerModel.data[context.rowIndex];
                    var widgetData = containerModel.widgetdatamap ? rowdata[containerModel.widgetdatamap[widgetModel.id]] : rowdata[widgetModel.id];
                    
                    if(widgetData && widgetData.onHover) {
                        eventReference = widgetData.onHover;
                    }

                }
                eventReference && $KU.executeWidgetEventHandler(widgetModel, eventReference, context);

            } else {
                if(widgetModel.onhover) {
                    widgetModel.onhover(widgetModel, context);
                }
            }
        }
    }
};

$KI.setappevents = function(eventobj) {
    $KU.logExecuting('kony.application.setApplicationInitializationEvents');
    $KU.logExecutingWithParams('kony.application.setApplicationInitializationEvents', eventobj);
    
    if($KG["appmode"] == constants.APPLICATION_MODE_HYBRID) {
        var initfunc;
        if(IndexJL)
            initfunc = window["appinit"];
        else
            initfunc = window["appInit"];

        initfunc && initfunc();
        $KU.logExecutingFinished('kony.application.setApplicationInitializationEvents VIA $KG["appmode"] == constants.APPLICATION_MODE_HYBRID ');
        return;
    }

    $KG["__konyappevents"] = eventobj;
    
    var preappinit = eventobj["preappinit"] || null;
    var appinit = eventobj["init"] || null;
    var postappinit = eventobj["postappinit"] || null;
    var appservice = eventobj["appservice"] || null;
    var showstartref = eventobj["showstartupform"] || null;
    var deepfunc = eventobj["deeplink"] || null;
    var launchparams = {};
    var startform = null;
    var launchobj = {};
    launchobj["launchparams"] = {};
    var formmodel;
    var testAutomationScriptURL, konyAutomationPath;


    
    if(window.location.hash) {
        
        var formId = kony.bm.getFormId(window.location.hash);
        if(formId) {
            launchparams['formID'] = formId;
            var formState = kony.bm.getBMState(formId);
            if(formState) {
                for(var k in formState) {
                    launchparams[k] = formState[k];
                }
            }
        }
    }

    launchobj["launchmode"] = $KG["__launchmode"];

    if($KG["kdeepobj"]) {
        launchobj["launchparams"] = $KG["kdeepobj"];
    }

    
    
    for(var prop in launchparams) {
        launchobj["launchparams"][prop] = launchparams[prop];
    }
    preappinit && preappinit(launchobj);


    $KU.setorientationDelay();


    appinit = $KU.returnEventReference(appinit);
    appinit && appinit(launchparams);

    if(appConfig.testAutomation) {
        testAutomationScriptURL = appConfig.testAutomation.scriptsURL;

        if(testAutomationScriptURL && testAutomationScriptURL.length !== 0
        && testAutomationScriptURL.startsWith('http')) {
            konyAutomationPath = appConfig.testAutomation.scriptsURL;
            konyAutomationPath = appConfig.testAutomation.scriptsURL + "Desktop";

            setTimeout(function() {
                $KAR && $KAR.invokeJasmineAutomation(konyAutomationPath);
            }, 1000);
        } else {
            kony.web.logger('log', 'Invalid test automation configuration.');
        }
    }

    kony.appinit.migrateLocalStorage();

    $KG.isMVC = $KG.appbehaviors.isMVC || false;
    launchparams["isRefresh"] = false;
    launchparams["isNewSPASession"] = (kony.appinit.isNewSession == "true") ? true : false;
    if(window.location.hash) {
        var formObj = window[window.location.hash.substring(2)];
        if(formObj && !launchparams["isNewSPASession"]) {
            launchparams["isRefresh"] = true;
            launchparams["refreshForm"] = formObj;
        }
    }
    for(var prop in launchparams) {
        launchobj["launchparams"][prop] = launchparams[prop];
    }



    if(postappinit) {
        startform = postappinit(launchobj);
    }

    if(deepfunc || appservice) {
        
        if(appservice) {
            $KG["__appservice"] = appservice; 
            startform = appservice(launchobj);
        } else if(deepfunc) {
            startform = deepfunc($KG["kdeepobj"]);
        }
    }

    if((startform == null) || (startform.length == 0)) {
        showstartref && showstartref(launchobj);
    } else {
        if(typeof startform == "string") {
            var homeform = $KG.allforms[startform];
            if(homeform) {
                homeform.show();
            } else {
                homeform = new kony.mvc.Navigation(startform);
                homeform.navigate();
            }

        } else {
            formmodel = startform;
            formmodel && formmodel.show();
        }

    }
    
    document.body.setAttribute('aria-busy', 'false');
    if($KG.appbehaviors["responsive"] === true) {
        $KU.addClassName(document.documentElement, 'responsive');
    }
    $KU.logExecutingFinished('kony.application.setApplicationInitializationEvents VIA end of the function ');
};


$KI.window = {
    openURL: function(url, params, name) {
        
        
        $KU.logExecuting('kony.application.openURL');
        $KU.logExecutingWithParams('kony.application.openURL', url, params, name);
        $KW.unLoadWidget();
        if(params) {
            if(params.innewwindow == true) {
                var newurl = "_blank";
                var newurloptions = "";
                newurloptions = (params.width ? "width =" + params.width + "px," : "") + (params.height ? "height=" + params.height + "px," : "");
                if(!params.menubar && typeof params.menubar !== "undefined")
                    newurloptions = newurloptions + "menubar = no, ";
                if(!params.statusbar && typeof params.statusbar !== "undefined")
                    newurloptions = newurloptions + "statusbar = no, ";
                if(!params.toolbar && typeof params.toolbar !== "undefined")
                    newurloptions = newurloptions + "toolbar = no, ";
                if(!params.titlebar && typeof params.titlebar !== "undefined")
                    newurloptions = newurloptions + "titlebar = no";
                $KU.logExecutingFinished('kony.application.openURL');

                window.open(url, newurl, newurloptions);
            } else {
                $KU.logExecutingFinished('kony.application.openURL');
                window.open(url);
            }
        } else {
            $KU.logExecutingFinished('kony.application.openURL');
            window.open(url);
        }
    },

    openURLAsync: function(config) {
        $KU.logExecuting('kony.application.openURLAsync');
        var url, callback;
        if(!config) {
            $KU.logErrorMessage('Invalid parameter');
            return;
        }
        $KU.logExecutingWithParams('kony.application.openURLAsync', config);
        url = config.url;
        callback = config.callback;
        window.open(url, "_blank");
        $KU.logExecutingFinished('kony.application.openURLAsync');
        callback && callback(constants.OPEN_URL_UNKNOWN);
    },

    alert: function(message, alertHandler, alertType) {
        if(message === null) return;

        var msgstr = message;
        var hndlr = alertHandler || null;
        var alerttype = alertType || null;

        if(message.message || message.alerttype || message.alertType) {
            alerttype = message.alerttype || message.alertType;
            msgstr = message.message;
            hndlr = message.alerthandler || message.alertHandler || null;
        }

        if(alerttype === constants.ALERT_TYPE_INFO || alerttype === constants.ALERT_TYPE_ERROR || !alerttype) {
            alert(msgstr);
            hndlr && hndlr();
        } else if(alerttype === constants.ALERT_TYPE_CONFIRMATION) {
            var answer = confirm(msgstr);
            hndlr && hndlr(answer);
        }
    },

    openMediaURL: function() {
        $KU.logWarnMessage('openMediaURL not supported in SPA');
    },


    
    showLoadingScreen: function() {
        var skin = arguments[0];
        var text = arguments[1] || "";
        var position = arguments[2] || "fullscreen";
        var isBlocked = (arguments[3] === false) ? false : true;
        var showProgressIndicator = (arguments[4] === false) ? false : true;

        text = text ? "<label style='padding-left:20px; font-size: 16px; text-align:center;width:100%;display:inline-block'>" + text + "</label>" : "";
        var wrapperDiv = "<div id ='__wrapperDiv' style='top:50%;width:100%;position:fixed;'>";
        var loadingDiv = document.getElementById("__loadingScreenDiv");
        var divTag = loadingDiv || document.createElement("div");
        divTag.id = "__loadingScreenDiv";
        divTag.setAttribute("style", "");
        divTag.style.zIndex = "100";
        divTag.style.backgroundPosition = "center";
        divTag.style.width = "100%";
        divTag.style.position = "fixed";
        if(!skin && showProgressIndicator) {
            divTag.style.backgroundImage = "url('" + $KU.getImageURL("loading.gif") + "')";
            divTag.style.backgroundRepeat = "no-repeat";
        }

        divTag.innerHTML = wrapperDiv + text + "</div>";
        divTag.style.display = "block";

        var mainContainer = document.getElementById("__MainContainer");
        if(mainContainer)
            mainContainer.appendChild(divTag);
        else
            return;

        var wrapper = divTag.childNodes[0];
        if(wrapper.childNodes[0])
            wrapper.style.marginTop = -(wrapper.childNodes[0].offsetHeight / 2) + "px";

        if(position == "fullscreen" || isBlocked) {
            divTag.className = skin || "";
            divTag.style.top = 0;
            divTag.style.left = 0;
            divTag.style.bottom = 0;
            divTag.style.height = "100%";
        } else {
            wrapper.className = skin || "";
            divTag.style.top = "50%";
        }
        divTag.tabIndex = -1;
        divTag.focus();
        
        kony.events.addEventListener(document, "keydown", $KI.window.preventBGFocus);
    },

    preventBGFocus: function(event) {
        if(!event)
            event = window.event;
        var dialog = document.getElementById('__loadingScreenDiv');
        if(dialog && dialog.style.display != "none") {
            kony.events.preventDefault(event);
            
            
        }
    },

    dismissLoadingScreen: function() {
        var loadingDiv = document.getElementById("__loadingScreenDiv");
        if(loadingDiv) {
            loadingDiv.style.display = "none";
        }
        
        kony.events.removeEventListener(document, "keydown", $KI.window.preventBGFocus);

    }
};

$KI.exit = function() {
    $KU.logExecuting('kony.application.exit');
    $KU.logExecutingWithParams('kony.application.exit');
    if($KU.isIDevice || !$KU.isMob) {
        window.open('about:blank', '_self', '');
        $KU.logExecutingFinished('kony.application.exit');
        window.close();
    }
};

$KI.appreset = function() {
    kony.web.logger("warn", "appreset not supported in SPA");
};

$KI.assert = function(arg1, arg2) {
    if(null === args1 || false === args2) {
        if(arguments.length > 1) {
            if(typeof(args2) === "string") {
                throw new Error(args2);
            } else {
                throw new Error("Invalid argument to assert");
            }
        } else {
            throw new Error("Assertion failed");
        }
    } else {
        return arg1;
    }
};

$KI.type = function(arg) {
    var result;

    if(typeof(arg) == "undefined" || arg + "" == "null") {
        result = IndexJL ? "nil" : "null";
    } else
    if(typeof(arg) === "boolean") {
        result = "boolean";
    } else
    if(typeof(arg) === "number") {
        result = "number";
    } else
    if(typeof(arg) === "string") {
        result = "string";
    } else
    if(typeof(arg) === "function") {
        result = "function";
    } else {
        result = IndexJL ? "table" : "object";
    }
    return result;
};

$KI.converttobase64 = function(rawbytes) {
    $KU.logExecuting('kony.convertToBase64');
    $KU.logExecutingWithParams('kony.convertToBase64', rawbytes);
    $KU.logExecutingFinished('kony.convertToBase64');
    return $KU.getBase64(rawbytes);
};

$KI.converttorawbytes = function() {
    $KU.logWarnMessage('converttorawbytes api not supported in SPA');
};

$KI.setappheaders = function(headers) {
    kony.app.headers = {};

    if(IndexJL) headers.splice(0, 1);

    for(i = 0; i < headers.length; i++) {
        kony.app.headers[headers[i].id] = headers[i];
        _konyConstNS.Form2.prototype.createFormLevelHierarchy.call(headers[i], headers[i].ownchildrenref);
    }
};

$KI.setappfooters = function(footers) {
    kony.app.footers = {};

    if(IndexJL) footers.splice(0, 1);

    for(i = 0; i < footers.length; i++) {
        kony.app.footers[footers[i].id] = footers[i];
        _konyConstNS.Form2.prototype.createFormLevelHierarchy.call(footers[i], footers[i].ownchildrenref);
    }
};

$KI.setapplicationcallbacks = function() {
    kony.web.logger("warn", "setApplicationCallbacks API is not supported on SPA, DesktopWeb and Responsive Web");
};

$KI.addapplicationcallbacks = function() {
    kony.web.logger("warn", "addApplicationCallbacks API is not supported on SPA, DesktopWeb and Responsive Web");
};

$KI.removeapplicationcallbacks = function() {
    kony.web.logger("warn", "removeApplicationCallbacks API is not supported on SPA, DesktopWeb and Responsive Web");
};

$KI.setapplicationbehaviors = function(appbehavior) {
    var key, FORMCONTROLLERSYNCLOAD = 'FormControllerSyncLoad';
    $KU.logExecuting('kony.application.setApplicationBehaviors');
    $KU.logExecutingWithParams('kony.application.setApplicationBehaviors', appbehavior);
    if(!$KG.appbehaviors) {
        $KG.appbehaviors = appbehavior;
    } else {
        for(key in appbehavior) {
            if(FORMCONTROLLERSYNCLOAD === key && undefined === $KG.appbehaviors[key]) {
                Object.defineProperty($KG.appbehaviors, FORMCONTROLLERSYNCLOAD, {
                    value: appbehavior[key],
                    writable: false
                });
            } else {
                $KG.appbehaviors[key] = appbehavior[key];
            }
        }
    }
    $KU.logExecutingFinished('kony.application.setApplicationBehaviors');
};

$KI.getapplicationbehavior = function(key) {
    return $KG.appbehaviors && $KG.appbehaviors[key];
};

$KI.setupWidgetDataRecording = function() {
    
    $KG.appbehaviors["recording"] = true;
};

$KI.setSeoDataReadyFlag = function() {
    $KU.logExecuting('kony.application.setSeoDataReadyFlag');
    $KU.logExecutingWithParams('kony.application.setSeoDataReadyFlag');
    document.body.setAttribute('data-ready', 1);
    $KU.logExecutingFinished('kony.application.setSeoDataReadyFlag');
};

$KI.removeSeoDataReadyFlag = function() {
    $KU.logExecuting('kony.application.removeSeoDataReadyFlag');
    $KU.logExecutingWithParams('kony.application.removeSeoDataReadyFlag');
    document.body.removeAttribute('data-ready');
    $KU.logExecutingFinished('kony.application.removeSeoDataReadyFlag');
};

function tobeimplemented(str) {
    str = (typeof str === 'string') ? str : "";
    kony.web.logger("warn", str + "  API is either not implemented or unsupported");
}

KonyError = function(errorcode, name, message) {
    this.errorCode = this.errorcode = errorcode;
    this.name = name;
    this.message = message;
};


KonyError.prototype = new Error();
KonyError.prototype.constructor = KonyError;

kony.getError = function(e) {
    $KU.logExecuting('kony.getError');
    $KU.logExecutingWithParams('kony.getError', e);
    $KU.logExecutingFinished('kony.getError');
    return e;
};

kony.bm = {
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    
    
    FORM_PREFIX: '#_',
    GSTATE_PREFIX: '/',

    __global_state__: {},
    __check_args__: function(args, count) {
        if(args.length != count) {
            $KU.logErrorMessage("Invalid number of arguments. Expected: " + count + ", Given: " + args.length);
            throw new Error("Invalid number of arguments. Expected: " + count + ", Given: " + args.length);
        }

        
        
        
        for(var i in args) {
            if(typeof(args[i]) === 'undefined') {
                throw new Error("Invalid arg[" + i + "] in " + args);
            }
        }
    },

    


    __initialized__: false,
    
    
    __init__: function() {
        var hp = window.location.href;
        if(hp.indexOf("http") == 0) {
            hp = kony.bm.__get_hash__(hp);
        }
        var stateStr = kony.bm.__get_raw_state__(hp);
        if(stateStr) {
            kony.bm.__global_state__ = JSON.parse(decodeURI(stateStr));
        }
        kony.bm.__initialized__ = true;
    },

    
    
    __update_hash__: function() {
        var jsonStr = JSON.stringify(kony.bm.__global_state__);
        var currentFormId = kony.bm.getFormId(window.location.hash);
        window.location.hash = kony.bm.FORM_PREFIX + currentFormId + kony.bm.GSTATE_PREFIX + encodeURI(jsonStr);
    },

    __get_hash__: function(href) {
        return href.substr(href.indexOf(kony.bm.FORM_PREFIX));
    },

    __get_raw_state__: function(hash_part) {
        var hp = hash_part; 
        var indexOfStateBegin = hp.indexOf(kony.bm.GSTATE_PREFIX);
        var rawState = ""; 
        if(indexOfStateBegin > 0) { 
            rawState = hp.substr(hp.indexOf(kony.bm.GSTATE_PREFIX) + kony.bm.GSTATE_PREFIX.length);
        }
        return rawState;
    },


    
    

    getFormId: function(hash_part) {
        var hp = hash_part; 
        if(!hp) { 
            hp = location.hash;
        }
        var formAndState = hp.substr(hp.indexOf(kony.bm.FORM_PREFIX) + kony.bm.FORM_PREFIX.length);
        var indexOfStateBegin = formAndState.indexOf(kony.bm.GSTATE_PREFIX);

        var formId;
        if(indexOfStateBegin < 0) { 
            formId = formAndState;
        } else {
            formId = formAndState.substr(0, indexOfStateBegin);
        }
        return formId;
    },

    
    

    
    
    
    
    
    setBMState: function(formId, json) {
        $KU.logExecuting('kony.application.setBMState');
        $KU.logExecutingWithParams("kony.application.setBMState", formId, json);
        kony.bm.__check_args__(arguments, 2);
        if(!kony.bm.__initialized__) {
            kony.bm.__init__();
        }
        kony.bm.__global_state__[formId] = json;
        kony.bm.__update_hash__();
        $KU.logExecutingFinished('kony.application.setBMState');
    },

    
    
    resetBMState: function(formId) {
        $KU.logExecuting('kony.application.resetBMState');
        $KU.logExecutingWithParams('kony.application.resetBMState', formId);
        kony.bm.__check_args__(arguments, 1);
        if(!kony.bm.__initialized__) {
            kony.bm.__init__();
        }
        delete kony.bm.__global_state__[formId];
        kony.bm.__update_hash__();
        $KU.logExecutingFinished('kony.application.resetBMState');
    },

    
    
    
    
    
    
    addBMState: function(formId, name, value) {
        $KU.logExecuting('kony.application.addBMState');
        kony.bm.__check_args__(arguments, 3);
        if(!kony.bm.__initialized__) {
            kony.bm.__init__();
        }
        $KU.logExecutingWithParams('kony.application.addBMState', formId, name, value);
        var s = kony.bm.getBMState(formId);
        if(!s) {
            s = {};
            kony.bm.setBMState(formId, s);
        }
        s[name] = value;
        kony.bm.__update_hash__();
        $KU.logExecutingFinished('kony.application.addBMState');
    },

    
    
    
    removeBMState: function(formId, name) {
        $KU.logExecuting('kony.application.removeBMState');
        $KU.logExecutingWithParams('kony.application.removeBMState', formId, name);
        kony.bm.__check_args__(arguments, 2);

        if(!kony.bm.__initialized__) {
            kony.bm.__init__();
        }
        var s = kony.bm.getBMState(formId);
        if(s) {
            delete s[name];
            kony.bm.__update_hash__();
        }
        $KU.logExecutingFinished('kony.application.removeBMState');
    },

    
    
    getBMState: function(formId) {
        $KU.logExecuting('kony.application.getBMState');
        $KU.logExecutingWithParams('kony.application.getBMState', formId);
        kony.bm.__check_args__(arguments, 1);

        if(!kony.bm.__initialized) {
            kony.bm.__init__();
        }
        $KU.logExecutingFinished('kony.application.getBMState');
        return kony.bm.__global_state__[formId];
    }
};

$KI.setUncaughtExceptionHandler = function(uncaughtExceptionHandler) {
    if(uncaughtExceptionHandler === null) {
        $KI.uncaughtExceptionHandler = null;
    } else if(typeof uncaughtExceptionHandler === 'function') {
        $KI.uncaughtExceptionHandler = uncaughtExceptionHandler;
    }
};

$KI.getUncaughtExceptionHandler = function() {
    return $KI.uncaughtExceptionHandler;
};

window.onerror = function(message, url, line, column, error) {
    var exceptionObject, stack;

    if($KI.uncaughtExceptionHandler) {
        exceptionObject = {
            "message": message,
            "sourceURL": url,
            "line": line,
            "column": column,
            "error": error
        };

        $KI.uncaughtExceptionHandler(exceptionObject);
    } else if(spaAPM) {
        spaAPM.apmErrorHandler(message, url, line, column, error);
    }

    if(appConfig.isDebug && appConfig.testAutomation && window.jasmineOnError) {
        if(arguments instanceof KonyError) {
            window.jasmineOnError(arguments);
        } else {
            stack = error ? error.stack : null;
            window.jasmineOnError({
                'name': 'jasmineException',
                'errorCode': '200', 
                'message': message,
                'sourceURL': url,
                'line': line,
                'stack': stack
            });
        }
    }
};



