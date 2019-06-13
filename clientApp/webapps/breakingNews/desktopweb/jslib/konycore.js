kony.events = {
    widgetEventMap: {},
    hiddenIFrame: null,
    isFrameworkEventsRegistered: false,

    addEvent: function(kEventType, kWidgetType, kEventHandler) {
        kony.events.widgetEventMap[kWidgetType] = kony.events.widgetEventMap[kWidgetType] || {};
        kony.events.widgetEventMap[kWidgetType][kEventType] = kEventHandler;
    },

    getEventHandler: function(eventObject) {
        eventObject = eventObject || window.event;
        
        
        var targetWidget = eventObject.target || eventObject.srcElement;
        var preventDefault = true, widget;
        var eventData, cellTemplateNode = null;

        
        if($KG["__idletimeout"] && $KG["__idletimeout"]["enabled"]) {
            var reset = $KI.appevents.resettimer();
            if(reset === false) return;
        }


        if(eventObject.type != "mousedown")
            $KW.Appmenu && $KW.Appmenu.hidemoreappmenuitems();

        cellTemplateNode = $KU.getParentByAttribute(targetWidget, 'kcelltemplate');
        if(cellTemplateNode != null) {
            targetWidget = cellTemplateNode.parentElement;
        }

        
        if(targetWidget.getAttribute('w-type') != "Calendar" && targetWidget.getAttribute('kwidgettype') != "Calendar") {
            $KW.Calendar && $KW.Calendar.destroyCalendar(null, null, targetWidget);
        }
        if(targetWidget.getAttribute('w-type-inactive')) {
            return;
        }


        
        var contextMenus = document.querySelectorAll("div[" + kony.constants.KONY_WIDGET_TYPE + "='MenuContainer']"),
            contextMenu = null;
        for(var cm = 0; cm < contextMenus.length; cm++) {
            if(eventObject.type == "click") {
                (function(node) {
                    var contextMenu = $KU.getModelByNode(node);
                    if(!contextMenu) { 
                        contextMenu = node.id.split('_'); 
                        contextMenu.splice(0, 1);
                        contextMenu = window[contextMenu.join('_')]; 
                    }
                    if(contextMenu.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_CONTEXTVIEW) {
                        node.style.visibility = "hidden";
                    }
                })(contextMenus[cm]);
            }
        }

        
        if(eventObject.type == "click" && typeof cvox == "undefined" && ($KU.isTouchSupported || $KU.isPointerSupported) && $KG["targetWidget"] && ($KG["moved"] || ($KG["targetWidget"] && targetWidget != $KG["targetWidget"] && (targetWidget.getAttribute('w-type') != "Calendar")))) {
            
            if(targetWidget.tagName == 'A' && targetWidget.getAttribute('href')) {
                kony.events.stopPropagation(eventObject);
                kony.events.preventDefault(eventObject);
            }
            
            $KG["targetWidget"] = "";
            $KG["moved"] = false;

            var src = eventObject.srcElement;
            
            if((src.getAttribute && src.getAttribute("kwidgettype") == "Calendar") || (src.parentNode && src.parentNode.getAttribute && src.parentNode.getAttribute("kwidgettype") == "Calendar")) {
                
            } else {
                return;
            }
        }

        if(targetWidget) {
            var targetWidgetType = targetWidget.getAttribute(kony.constants.KONY_WIDGET_TYPE);

            if(targetWidget.tagName == 'A')
                eventData = [targetWidget.innerText, targetWidget.getAttribute('href')];

            if(targetWidget.getAttribute('tpwidgettype')) {
                $KW.Popup && $KW.Popup.dismissPopup(null, eventObject);
                return;
            } else if(!targetWidgetType) {
                
                var targetChild = targetWidget.childNodes[0];
                if(targetWidget.getAttribute("index") && targetChild && targetChild.getAttribute("kwidgettype") == "Segment") {
                    targetWidget = targetChild;
                    targetWidgetType = "Segment";
                } else {
                    
                    var konyWidget = $KU.getParentByAttribute(targetWidget, kony.constants.KONY_WIDGET_TYPE);
                    
                    if(targetWidget && targetWidget.tagName == "CANVAS" && $KU.isIE11 && konyWidget && konyWidget.getAttribute("kwidgettype") == "googlemap") {
                        return;
                    }
                    var thirdPartyWidget = $KU.getParentByAttribute(targetWidget, 'tpwidgettype');
                    targetWidget = konyWidget;
                    
                    if(!targetWidget || thirdPartyWidget) {
                        $KW.Popup && $KW.Popup.dismissPopup(null, eventObject);
                        return;
                    }
                    targetWidgetType = targetWidget.getAttribute(kony.constants.KONY_WIDGET_TYPE);
                }
            }

            if(targetWidgetType == 'RadioButtonGroup' || targetWidgetType == 'CheckBoxGroup' || targetWidgetType == 'ComboBox' || targetWidgetType == 'ListBox') {
                
                if($KU.preventClickEvent(eventObject, targetWidget))
                    return;
            }

            
            var pf = $KU.getContainerForm(targetWidget);

            if(eventObject.type == "contextmenu") {
                var contextNode = (targetWidget.getAttribute('kcontextmenuid')) ? targetWidget : $KU.getParentByAttribute(targetWidget, 'kcontextmenuid');
                if(!contextNode) return;
                var model = $KU.getModelByNode(contextNode);
                if(model && model.contextmenu && model.contextmenu.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_CONTEXTVIEW) {
                    kony.events.preventDefault(eventObject);
                    contextNode = document.getElementById(model.pf + "_" + model.contextmenu.id);

                    if(typeof model.onrightclick === 'function' && model.contextmenu) {
                        if(['MenuContainer', 'Segment', 'DataGrid'].indexOf(model.wType) >= 0) {
                            var indexAttr = $KW.Utils.getIndexAttrNameByContainerModel(model),
                                itemIndex = null,
                                itemData = null,
                                colIndex = null,
                                secindex = null,
                                index = null;
                            itemIndex = $KU.getParentByAttribute(targetWidget, indexAttr).getAttribute(indexAttr).split(',');

                            if(model.wType === "DataGrid") {
                                colIndex = $KU.getParentByAttribute(event.srcElement, 'colindex').getAttribute('colindex');
                                if(colIndex) {
                                    var colIndexArray = colIndex.split(",");
                                    model.onrightclick(model, colIndexArray[0] * 1, colIndexArray[1] * 1);
                                }
                            } else if(model.wType === "Segment") {
                                secindex = $KU.getParentByAttribute(event.srcElement, 'secindex');
                                if(secindex) {
                                    secindex = secindex.getAttribute('secindex');
                                    var secindexArray = secindex.split(",");
                                    model.onrightclick(model, secindexArray[0] * 1, secindexArray[1] * 1, model.selectedState);
                                } else {
                                    index = $KU.getParentByAttribute(event.srcElement, 'index').getAttribute('index');
                                    model.onrightclick(model, null * 1, index * 1, model.selectedState);
                                }
                            } else {
                                itemData = $KW.Utils.getRowDataByContainerModelAndIndex(model, itemIndex);
                                model.onrightclick(model, itemIndex, itemData);
                            }
                        } else {
                            model.onrightclick(model);
                        }
                    }

                    var body = document.getElementById('__MainContainer');

                    if(!body) {
                        body = document.body;
                    }

                    if(contextNode) {
                        body.removeChild(contextNode);
                    }

                    var div = document.createElement("div");
                    var menuContext = new $KW.WidgetGenerationContext(model.pf);
                    model.contextmenu.pf = model.pf;
                    div.innerHTML = $KW.MenuContainer.render(model.contextmenu, menuContext);
                    contextNode = div.firstChild;
                    body.appendChild(contextNode);

                    contextNode.style.visibility = "visible";
                    contextNode.style.position = "fixed"; 
                    contextNode.style.top = ((eventObject.clientY || eventObject.pageY) + 1) + 'px';
                    contextNode.style.left = ((eventObject.clientX || eventObject.pageX) + 1) + 'px';
                }
                return;
            }

            
            if(!eventObject.type.startsWith("mouse") && $KW.Popup && $KW.Popup.dismissPopup(pf, eventObject))
                return;



            
            var widgetModel = $KU.getModelByNode(targetWidget);
            if(widgetModel && widgetModel.disabled)
                return;

            var widgetEventObj = kony.events.widgetEventMap[targetWidgetType];
            if(widgetEventObj && widgetEventObj[eventObject.type]) {
                

                
                if(!$KW.Utils.isWidgetInteractable(targetWidget, true)) {
                    return;
                }

                
                var eventHandler = widgetEventObj[eventObject.type];
                if(targetWidgetType == 'RichText') {
                    
                    if(!widgetModel.onclick)
                        preventDefault = false;
                }
                var target = eventObject.target || eventObject.srcElement;
                if(!(targetWidgetType == "TextField" || targetWidgetType == "CheckBoxGroup" || targetWidgetType == "TextArea" ||
                        targetWidgetType == "RadioButtonGroup" || targetWidgetType == "ListBox" || (targetWidgetType == "DataGrid" && target.type == "checkbox"))) {
                    if(preventDefault) {
                        kony.events.stopPropagation(eventObject);
                        kony.events.preventDefault(eventObject);
                    }
                }

                var editableCombos = document.querySelectorAll("div[name='SelectOptions']");
                if(editableCombos) {
                    for(var i = 0; i < editableCombos.length; i++) {
                        if(editableCombos[i].style.display == "block") {
                            if(targetWidget.id != editableCombos[i].parentNode.id)
                                editableCombos[i].style.display = "none";
                        }
                    }
                }

                
                
                if(targetWidgetType == 'RichText' && eventData) 
                    eventHandler(eventObject, targetWidget, eventData);
                else
                    eventHandler(eventObject, targetWidget, target);

                if(!kony.system.activity.hasActivity()) {
                    $KW.skins.removeBlockUISkin();
                    $KW.unLoadWidget();
                }
            }
        }
    },

    addEventListener: function(object, type, listener, bCapture) {
        if(!object)
            return;
        if(!listener)
            listener = kony.events.getEventHandler;
        if(!bCapture)
            bCapture = false;

        if(object.addEventListener)
            object.addEventListener(type, listener, bCapture); 
        else if(object.attachEvent)
            object.attachEvent('on' + type, listener); 
    },

    removeEventListener: function(object, type, listener, bCapture) {
        if(!object)
            return;
        if(!listener)
            listener = kony.events.getEventHandler;
        if(!bCapture)
            bCapture = false;

        if(object.removeEventListener)
            object.removeEventListener(type, listener, bCapture); 
        else if(object.attachEvent)
            object.detachEvent('on' + type, listener); 
    },

    preventDefault: function(eventObject) {
        if(!eventObject)
            return;

        if(eventObject.preventDefault)
            eventObject.preventDefault();
        else
            eventObject.returnValue = false;
    },

    stopPropagation: function(eventObject) {
        if(!eventObject)
            return;
        if(eventObject.stopPropagation) {
            eventObject.stopPropagation();
            eventObject.stopImmediatePropagation && eventObject.stopImmediatePropagation();
        } else
            eventObject.cancelBubble = true;
    },

    ontouchstartHandler: function(e) {
        if(($KU.isIE || $KU.isPointerSupported ? e : e.changedTouches)) {
            var target = e.changedTouches ? (e.changedTouches[0].target || e.changedTouches[0].srcElement) : (e.target || e.srcElement);
            var widgetNode;
            if(target.nodeType == 3)
                target = target.parentNode;
            $KG["targetWidget"] = target;
            $KG["moved"] = false;
        }
    },

    ontouchmoveHandler: function(e) {
        var up = false;
        var down = false;
            $KG["moved"] = true;

    },

    registerDocumentEvents: function() {
        var main = ($KU.isWindowsPhone && $KU.isIE9) ? document : document.getElementById("__MainContainer");

        kony.events.addEventListener(main, 'click');
        kony.events.addEventListener(main, 'contextmenu');
        kony.events.addEventListener(main, 'mousedown');
        kony.events.addEventListener(main, 'mouseup');
        kony.events.addEventListener(main, 'input');
        kony.events.addEventListener(main, 'change');
        kony.events.addEventListener(main, 'keydown');
        kony.events.addEventListener(main, 'keyup');
        if($KG["useNativeScroll"]) {
            kony.events.addEventListener(main, 'touchstart', function() {});
            kony.events.addEventListener(main, 'touchmove', function() {});
        }
        kony.appinit.initializeWidgets();
        kony.events.orientationregistration();
        kony.events.addEventListener(window, 'unload', kony.events.unregisterListeners);
        window.onbeforeunload = function(e) {
            if(window.refreshMessage) {
                setTimeout(function() {
                    $KG["__appservice"] && $KG["__appservice"]({
                        isRefresh: true,
                        refreshForm: $KG["__currentForm"]
                    });
                }, 500);
                return refreshMessage;
            }
        }
        kony.events.isFrameworkEventsRegistered = true;
        kony.events.formDisableonModalPopup();
    },

    formDisableonModalPopup: function() {
        kony.events.addEventListener(document, "focus", function(event) {
            var modalpopup = document.querySelector("div.popupcontainer form");

            if(modalpopup) {
                kony.web.logger("log", modalpopup + " " + modalpopup.id);
                var dialog = document.getElementById(modalpopup.id);
                if(dialog && !dialog.contains(event.target)) {
                    event.stopPropagation();
                    
                    if(kony.appinit.isChrome) {
                        var inpElement = dialog.querySelector('select,input,a,textarea');
                        inpElement && inpElement.focus();
                    } else {
                        dialog.tabIndex = -1;
                        dialog.focus();
                    }
                }
            }
        }, true);
    },

    unregisterListeners: function(formID) {
        var main = $KU.isWindowsPhone ? document : document.getElementById("__MainContainer");
        kony.events.removeEventListener(main, 'click');
        kony.events.removeEventListener(main, 'touchstart');
        kony.events.removeEventListener(main, 'touchmove');
        kony.events.removeEventListener(main, 'change');
        kony.events.removeEventListener(main, 'keydown');
        kony.events.removeEventListener(main, 'keyup');
        kony.events.removeEventListener(main, 'touchstart');
        kony.events.removeEventListener(main, 'mousedown');
        kony.events.removeEventListener(main, 'mouseup');



        
        if($KU.hashChange) {
            kony.events.removeEventListener(window, 'hashchange');
        }

        
        $KW.Form.delistSystemTimerActions();
    },

    windowSizeChange: function() {
        if($KG.appbehaviors["responsive"] === true) {
            var resizeDelay =  $KU.orientationDelay;
            
            
            if(kony.appinit.isIDevice && kony.appinit.isPWAStandalone()) {
                resizeDelay = 100;
            }
            setTimeout(function () {
                if($KW.FlexUtils.isFlexContainer($KG["__currentForm"])) {
                    $KW.Form.initializeFlexContainersIfNeeded($KG["__currentForm"], function(formNode) {
                        formNode.style.height = $KW.Form.getFormHeight();
                        $KW.Form.resizeHandler($KG["__currentForm"], $KU.getWindowWidth());
                    });
                    $KG.__currentForm.forceLayout();
                } else {
                    $KW.Form.resizeHandler($KG["__currentForm"], $KU.getWindowWidth());
                }
            }, resizeDelay);
        }
    },
    

    windowOrientationChange: function() {
        var event = window.event;
        var orientation = $KU.detectOrientation();
        var winNewWidth = $KU.getWindowWidth();
        var winNewHeight = $KU.getWindowHeight();

        if(orientation != undefined && orientation == $KG["__orientation"]) {
            if(kony.appinit.isMob || kony.appinit.isTablet) {
                $KW.Form.initializeFlexContainersIfNeeded($KG["__currentForm"], function() {
                    $KW.Form.setFormDimensions($KG["__currentForm"]);
                });
            }
            return;
        }
        else
            $KG["__orientation"] = orientation;
        if($KG["__currentForm"]) {

            
            window.clearTimeout(kony.events.orientationTimeoutId);
            kony.events.orientationTimeoutId = setTimeout(function() {
                
                var eventList = kony.events.widgetEventMap || {};
                for(var k in eventList) {
                    var widgetType = eventList[k];
                    var eventHandler = widgetType["onorientationchange"] || widgetType["onresize"];
                    eventHandler && eventHandler($KG["__currentForm"].id, $KG["__orientation"]);
                }

                $KW.Form.resizeForm($KG["__currentForm"].id, true);

            }, $KU.orientationDelay);
        }
        

    },

    orientationregistration: function() {
        $KG["__orientation"] = $KU.detectOrientation();
        kony.events.addEventListener(window, "resize", kony.events.windowSizeChange);
        if(!kony.appinit.isMob && !kony.appinit.isTablet) {
            return;
        }
        var orientationEvent = ($KU.isOrientationSupported && !$KU.isAndroid) ? "orientationchange" : "resize";
        kony.events.addEventListener(window, orientationEvent, kony.events.windowOrientationChange);
        if($KU.isOrientationSupported && $KU.isAndroid)
            kony.events.addEventListener(window, "orientationchange", kony.events.windowOrientationChange);
    },

    canExecuteEventHandler: function(widgetModel, event) {
        if(widgetModel[event]) {
            return true;
        }
        return false;
    },

    executeBoxEvent: function(wModel, rowdata, containerModel) {
        if(rowdata && containerModel) { 
            var rowModelData = null,
                clickHandler = null,
                extendedModel = null,
                context;

            if(containerModel.wType == 'Segment' || containerModel.wType == "CollectionView") {
                var sectionIndex = containerModel.currentIndex[0];
                var rowIndex = containerModel.currentIndex[1];
                var clonedTemplate = $KW.Utils.getClonedModelByContainerUsingIndex(containerModel, rowIndex, sectionIndex);

                if(!clonedTemplate) {
                    return false;
                }
                wModel = $KU.getValueFromObjectByPath($KW.Utils.getWidgetPathByModel(wModel), clonedTemplate);
                if(containerModel.wType == 'Segment') {
                    context = {
                        sectionIndex: sectionIndex,
                        rowIndex: rowIndex,
                        widgetInfo: containerModel
                    };
                } else {
                    context = {
                        sectionIndex: sectionIndex,
                        itemIndex: rowIndex,
                        widgetInfo: containerModel
                    };
                }
            }

            parentModel = wModel;

            while(parentModel) {
                var widgetData = containerModel.widgetdatamap ? rowdata[containerModel.widgetdatamap[parentModel.id]] : rowdata[parentModel.id];

                if(widgetData && (containerModel.wType != 'Segment') && (containerModel.wType != 'CollectionView')) {
                    rowModelData = $KU.cloneObj(widgetData);
                    if(typeof rowModelData === 'string') {
                        rowModelData = (parentModel.wType === 'Image') ? {
                            "src": rowModelData
                        } : {
                            "text": rowModelData
                        };
                    }
                    if(!IndexJL) {
                        for(var p in rowModelData) {
                            if(rowModelData.hasOwnProperty(p) && p !== p.toLowerCase()) {
                                rowModelData[p.toLowerCase()] = rowModelData[p];
                            }
                        }
                    }

                    clickHandler = rowModelData.onclick || parentModel.onclick;
                    if(clickHandler && rowModelData.enable !== false) {
                        extendedModel = $KU.extend(rowModelData, parentModel);
                        this.fireBoxEvent(extendedModel, context);
                        return true;
                    }
                } else if(this.canExecuteEventHandler(parentModel, "onclick") && parentModel.enable !== false) {
                    this.fireBoxEvent(parentModel, context);
                    return true;
                }

                parentModel = parentModel.parent;
                if(!parentModel) return false;
            }
        } else {
            var formId = wModel.pf;
            var pModel = wModel;
            var form = $KG.allforms[formId] || $KG.allTemplates[formId] || $KG.__currentForm;
            while(pModel) {
                
                if(this.canExecuteEventHandler(pModel, "onclick") || (pModel.parent && formId == pModel.parent.id && pModel.parent.wType != 'HBox') || pModel.id == form.id) {
                    if(this.canExecuteEventHandler(pModel, "onclick")) {
                        this.fireBoxEvent(pModel);
                        return true;
                    }
                    return false;
                }
                
                if(form.topLayerFCModal && pModel === form.topLayerFCModal) {
                    return true;
                }
                pModel = pModel.parent;
            }
            return false;
        }
    },



    
    fireBoxEvent: function(widgetModel, context) {
        var eventReference = $KU.returnEventReference(widgetModel.onclick);

        if(eventReference && widgetModel.blockeduiskin) {
            $KW.skins.applyBlockUISkin(widgetModel);
        }
        if(!widgetModel.containerID && widgetModel.wType != "Segment" && (widgetModel.parent && widgetModel.parent.wType != "TabPane")) {
            var widgetNode = $KU.getNodeByModel(widgetModel);
            $KW.HBox.setProgressIndicator(widgetNode);
        }

        eventReference && (context ? $KU.executeWidgetEventHandler(widgetModel, eventReference, context) : $KU.executeWidgetEventHandler(widgetModel, eventReference));
        $KU.onEventHandler(widgetModel);
    },

    
    executeActionOnContainer: function(containerModel, action, execActionBeforeChildFlag) {
        for(var i = 0; i < containerModel.children.length; i++) {
            var childModel = containerModel[containerModel.children[i]];
            childModel = $KW.Utils.getActualWidgetModel(childModel);

            if(childModel.isContainerWidget) {
                if(execActionBeforeChildFlag)
                    this.executeActionEvt(childModel, childModel[action]);
                this.executeActionOnContainer(childModel, action, execActionBeforeChildFlag);
                if(!execActionBeforeChildFlag)
                    this.executeActionEvt(childModel, childModel[action]);
            }
        }
    },

    executeActionEvt: function(widgetModel, actionEvt) {
        if(!actionEvt) return;
        if(widgetModel.isMaster) {
            var actionref = $KU.returnEventReference(actionEvt);
            actionref && $KU.executeWidgetEventHandler(widgetModel, actionref);
        }
    },

    browserback: {
        currentHash: window.location.hash,

        HASH_PREFIX: '#_',

        
        handleBrowserBackEvent: function() {

            var showForm = false;
            var previousFormID;
            
            

            if(location.hash && kony.events.browserback.currentHash && location.hash !== kony.events.browserback.currentHash) {
                showForm = true;
                previousFormID = kony.bm.getFormId(location.hash);
            }

            var formModel = $KG["__currentForm"];
            if(showForm) {
                var ondeviceback = $KG["__currentForm"] && $KU.returnEventReference(formModel.ondeviceback);
                if(ondeviceback) {
                    
                    location.hash = kony.events.browserback.HASH_PREFIX + formModel.id;
                    ondeviceback();
                    return;
                }
                var previousFormModel = $KG.allforms[previousFormID];
                if(previousFormModel && previousFormModel.wType == "Form" && previousFormID !== formModel.id) {
                    previousFormModel["isfromBrowserBack"] = true;
                    $KW.Form.show(previousFormModel);
                } else if(!previousFormModel) { 
                    
                    location.hash = kony.events.browserback.HASH_PREFIX + formModel.id;
                }
                
            }
        },

        
        
        updateURLWithLocation: function(formID) {
            if(formID) {
                var currentFormID = kony.bm.getFormId(kony.events.browserback.currentHash);
                if(currentFormID !== formID) {
                    location.hash = kony.events.browserback.currentHash = this.HASH_PREFIX + formID;
                }
            }
        },

        setHistory: function() {
            if(kony.events.hiddenIFrame.location.hash != location.hash) {
                
                kony.events.hiddenIFrame.document.open();
                kony.events.hiddenIFrame.document.close();
                kony.events.hiddenIFrame.location.hash = location.hash;
            }
        }
    }
};


window.onload = function() {
    setTimeout(function() {
        window.scrollTo(0, 1);
    }, 100);
};

window.onbeforeprint = function(e) {
    var formModel = kony.application.getCurrentForm(),
        formNode = $KU.getNodeByModel(formModel);

    formModel.media = {type:'print', height:formNode.style.height, width:document.body.style.width};
    formNode.style.height = formNode.scrollHeight + 'px';
    document.body.style.width = formModel.media.width;
};

window.onafterprint = function(e) {
    var formModel = kony.application.getCurrentForm(),
        formNode = $KU.getNodeByModel(formModel);

    document.body.style.width = formModel.media.width;
    formNode.style.height = formModel.media.height;
    delete formModel.media;
};
