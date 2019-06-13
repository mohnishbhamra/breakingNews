$KW.Popup = (function() {
    
    

    var module = {
        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            switch(propertyName) {
                case "ismodal":
                case "transparencybehindthepopup":
                    var opacity = 1 - (widgetModel.transparencybehindthepopup / 100);
                    var popuplayer = document.getElementById('__popuplayer');
                    var popupcontainer = document.getElementById(widgetModel.id + '_container');
                    if(popuplayer) {
                        popuplayer.style.opacity = opacity;
                    }
                    break;
                case "title":
                    var titleBar = document.getElementById(widgetModel.id + '_titlebar');
                    if(titleBar) {
                        titleBar.childNodes[0].innerHTML = propertyValue;
                    }
                    break;
            }
        },

        render: function(popupModel) {
            if($KG["localization"]) {
                $KI.i18n.translateFormModel(popupModel);
            }

            var htmlString = "";
            var style = "";
            var popupId = popupModel.id;
            var cwtSkin = $KW.skins.getMarPadAdjustedContainerWeightSkin(popupModel, popupModel.ismodal ? "" : 100) + " " + ((popupModel.ismodal && popupModel.skin) ? popupModel.skin : "");
            var opacity = 1 - (popupModel.transparencybehindthepopup / 100);
            style = "opacity:" + opacity;

            if(popupModel.ismodal) {
                htmlString = "<div id='__popuplayer' style='" + style + "' class='popuplayer'></div>";
            }

            htmlString += "<form action='javascript:;' id='" + popupId + "' class='" + cwtSkin + "' style='z-index:9;" + (!popupModel.skin ? "background-color:white;" : "") + (popupModel.ismodal ? "xoverflow:auto;position:absolute;max-height:" + (popupModel.containerheight || 80) + "%;" : "") + "'>";

            htmlString += this.generatePopupHeader(popupModel);
            htmlString += "<div id='" + popupId + "_body' style='position:relative;width:100%;'>";
            htmlString += "<div style='" + $KW.skins.getPaddingSkin(popupModel) + "'>";
            htmlString += popupModel.header ? $KW.Form.generateHeader(popupModel.header, "header") : "";

            
            if(popupModel.children) {
                var context = new $KW.WidgetGenerationContext(popupModel.id);
                if(popupModel.layouttype == constants.CONTAINER_LAYOUT_GRID) {
                    htmlString += $KW.Grid.render(popupModel, context);
                } else {
                    for(var i = 0; i < popupModel.children.length; i++) {
                        htmlString += $KW.Form.generateWidget(popupModel, popupModel[popupModel.children[i]]);
                    }
                }
            }

            htmlString += popupModel.footer ? $KW.Form.generateHeader(popupModel.footer, "footer") : "";
            htmlString += "</div></div>";
            if(popupModel.resizable) {
                htmlString += "<div><div id='" + popupId + "_resizearea' class='resizearea'></div></div>";
            }
            htmlString += "</form>";

            var popup = document.createElement("div");
            popup.id = popupId + "_container";

            if(!popupModel.ismodal) {
                popup.className = popupModel.skin || "";
                popup.style.position = "fixed";
                popup.style.overflow = "hidden";
                if(!popupModel.resizable)
                    popup.style.maxHeight = (popupModel.containerheight || 80) + "%";
                
                popup.style.width = (popupModel.containerweight * document.getElementsByTagName("body")[0].offsetWidth / 100) + "px";
                popup.setAttribute("name", 'nonmodalpopup');
                popup.setAttribute("kformname", popupId);
            } else {
                popup.className = "popupcontainer";
            }
            popup.style.visibility = "hidden";
            popup.innerHTML = htmlString;

            
            module.zindex = module.zindex || 10;
            popup.style.zIndex = ++module.zindex;

            var main = $KU.getElementById("__MainContainer");
            if(!main) {
                htmlString = "<div id='__MainContainer'></div>";
                document.body.innerHTML = htmlString;
                main = $KU.getElementById("__MainContainer");
            }
            main.appendChild(popup);

            var mouseEvent = kony.appinit.isFirefox ? "DOMMouseScroll" : "mousewheel";
            kony.events.addEventListener(popup, mouseEvent, function(e) {
                var delta = e.wheelDelta ? (e.wheelDelta / 120) : (e.detail ? (-e.detail / 3) : 0);
                e = e || window.event; 
                
                var target = e.target || e.srcElement;
                var parentScroller = module.getParentScroller(target, delta, popup);
                if(!parentScroller) kony.events.preventDefault(e);
            });
        },

        getParentScroller: function(node, delta, parent) {
            var cur = node;
            while(cur) {
                var diffY = cur.scrollHeight - cur.offsetHeight;
                var diffX = cur.scrollWidth - cur.offsetWidth;
                if(diffY > 1) {
                    if(delta < 0 && (diffY - cur.scrollTop) > 0) {
                        return cur;
                    }
                    if(delta > 0 && cur.scrollTop > 0) {
                        return cur;
                    }
                }
                if(diffX > 1) {
                    if(delta < 0 && (diffX - cur.scrollLeft) > 0) {
                        return cur;
                    }
                    if(delta > 0 && cur.scrollLeft > 0) {
                        return cur;
                    }
                }
                if(cur === parent) return false;
                cur = cur.parentNode;
            }
        },

        show: function(popupModel) {
            
            $KW.Calendar && $KW.Calendar.destroyCalendar();

            !kony.system.activity.hasActivity() && $KW.skins.removeBlockUISkin();

            var popupelem = $KU.getElementById(popupModel.id + "_container");
            if(popupelem) {
                this.dismiss(popupModel);
            }
            $KU.updateScrollFlag(popupModel);
            
            this.render(popupModel);

            var popupContainer = $KU.getElementById(popupModel.id + "_container");
            var context = popupModel.context;
            var widget = context && context.widget;
            var elem = $KU.getNodeByModel(widget);
            if(context && context.widget && context.isenabled && !popupModel.enableScroll) {
                if(elem && $KU.getPosition(elem).top == 0) {
                    popupContainer.style.top = elem.offsetHeight + "px";
                }
            }
            $KW.TPW.renderWidget(popupModel.id);
            
            popupelem = popupContainer;

            if(popupModel.ismodal)
                popupelem = popupContainer.getElementsByTagName('form')[0]; 

            if((!$KG["disableTransition"] || $KU.isBlackBerryNTH) && kony.appinit.useTransition) {
                
                $KW.Form.initializeTouchWidgets(popupModel.id)
            } else {
                if(popupModel.ismodal)
                    popupelem.parentNode.style.visibility = "visible";
                else
                    popupelem.style.visibility = "visible";
                $KW.Scroller.initializePageViews(popupModel.id);
                $KW.Form.initializeView(popupModel.id);
            }

            if(popupModel.draggable) {
                var header = $KU.getElementById(popupModel.id + "_titlebar");
                if(header) {
                    popupModel.drag = new $KW.touch.Drag(popupModel, popupelem, header, popupelem.parentNode, this.dragEvent, popupelem);
                    module.undockedpopups = module.undockedpopups || {};
                    module.undockedpopups[popupModel.id] = popupModel;
                }
            }

            if(popupModel.resizable) {
                var resizeNode = $KU.getElementById(popupModel.id + "_resizearea");
                new $KW.touch.Drag(popupModel, popupelem, resizeNode, popupelem.parentNode, this.dragEvent, popupelem);
            }

            var popupLayer = document.getElementById('__popuplayer');
            if(popupLayer)
                popupLayer.style.width = document.body.style.width;

            if(kony.appinit.isFirefox)
                popupelem.parentNode.style.zIndex = module.zindex;
            
            var mapCanvasElement = popupContainer.querySelectorAll('[name=map_canvas]')[0];
            var scriptloaded = $KG["mapScriptLoaded"];
            if(mapCanvasElement && scriptloaded)
                $KW.Map.setUpInteractiveCanvasMap(); 

            $KU.changea11yDynamicElement(popupModel.id);
            
            

            this.updateContainerHeight(popupModel, popupContainer);
            
            if(!$KG["disableTransition"] || $KU.isBlackBerryNTH) {
                this.applyTransition(popupModel, popupelem);
            }
        },

        
        updateContainerHeight: function(popupModel, popup) {
            
            var popupelem = popupModel.ismodal ? popup.childNodes[1] : popup;
            if(popupModel.containerheight || popupModel.containerheight == 0) {
                popupelem.style.maxHeight = "";
                popupelem.style.height = '100%';
            } else {
                popupelem.style.height = 'auto';
            }
            $KU.setScrollHeight(popupModel, popupelem);
            this.setPopupBodyHeight(popupModel, popupelem);
            this.setPopupPosition(popupModel, popupelem);
        },

        
        setPopupBodyHeight: function(popupModel, popup) {
            var header = $KU.getElementById(popupModel.id + "_titlebar"); 
            if(header) {
                var controls = $KU.getElementById("minmax_" + popupModel.id);
                if(controls) {
                    header.style.height = (kony.appinit.isFirefox ? controls.offsetHeight + 20 : controls.parentNode.clientHeight) + "px";
                }
                var pBody = header.parentNode.childNodes[1];
                var padding = parseInt($KU.getStyle(pBody, "padding-top").replace("px", ""), 10) + parseInt($KU.getStyle(pBody, "padding-bottom").replace("px", ""), 10);
                pBody.style.height = ((popupModel.ismodal ? header.parentNode.clientHeight : popup.clientHeight) - padding - header.clientHeight - (popupModel.resizable ? 13 : 0)) + "px";
                pBody.style.overflow = "auto";
            } else {
                popup.style.overflow = "auto";
            }
        },

        
        setPopupPosition: function(popupModel, popupelem) {
            

            
            if(!popupModel.context) {
                var screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                var screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                popupelem.style.top = Math.floor((100 - Math.floor((popupelem.offsetHeight * 100) / screenHeight)) / 2) + "%";
                
                if(Math.floor((100 - Math.floor((popupelem.offsetHeight * 100) / screenHeight)) / 2) < 10) {
                    popupelem.style.top = "0%";
                }
                popupelem.style.left = Math.floor((100 - Math.floor((popupelem.offsetWidth * 100) / screenWidth)) / 2) + "%";
            }
        },

        dismiss: function(model) {
            
            
            var popupelemContainer = model ? $KU.getElementById(model.id + "_container") : document.querySelector("div[class~='popupmain']");
            if(popupelemContainer) {
                
                
                var popupelem = popupelemContainer.getElementsByTagName('form')[0];
                if(!model) {
                    var id = popupelem.id.split("_")[0];
                    model = window[id];
                }
                if(model.ptranOut && (model.ptranOut.toLowerCase() != "none") && (!$KG["disableTransition"] || $KU.isBlackBerryNTH)) {
                    this.applyTransition(model, (model.ismodal ? popupelem : popupelemContainer), true);
                } else {
                    module.domremove(popupelem);
                }

                module.dockedpopups = module.dockedpopups || {};
                if(module.dockedpopups[model.id])
                    delete module.dockedpopups[model.id];

                module.undockedpopups = module.undockedpopups || {};
                if(module.undockedpopups[model.id])
                    delete module.undockedpopups[model.id];

                this.updateMinimizePositions(model);

                if(model.drag) {
                    model.drag.removeDrag();
                }

                var hideref = $KU.returnEventReference(model.onhide || model.onHide);
                hideref && hideref.call(model, model);
                model.isMinimized = false;
            }
        },

        domremove: function(popupelem) {
            if(popupelem) {
                var popupelemMain = popupelem.parentNode;
                popupelemMain.parentNode.removeChild(popupelemMain);
            }
        },

        minimize: function(popupelem, event) {
            if(popupelem) {
                var header = popupelem.parentNode.parentNode;
                var popup = header.parentNode;
                var model = $KG.allforms[popup.id];
                if(model.isMinimized) return;

                module.dockedpopups = module.dockedpopups || {};
                module.dockedpopups[popup.id] = model;

                module.undockedpopups = module.undockedpopups || {};
                if(model && module.undockedpopups[model.id])
                    delete module.undockedpopups[model.id];

                popupelem.src = $KU.getImageURL(model.titlebarconfig.maxicon);
                popupelem.title = 'Maximize';

                popupelem.onclick = function(event) {
                    if(!event) event = window.event;
                    module.maximize(this, event);
                };
                var popupContainer = model.ismodal ? popup : popup.parentNode;
                model.width = popupContainer.style.width;
                popupContainer.style.width = '20%';
                popupContainer.style.overflow = "";
                popup.children[1].style.display = "none";
                model.position = [popupContainer.style.top, popupContainer.style.left];
                this.updateMinimizePositions(model);
                if(model.drag) {
                    model.drag.removeDrag();
                }
                if(model.resizable)
                    $KU.getElementById(model.id + "_resizearea").style.display = "none";
                model.isMinimized = true;
            }
        },

        maximize: function(popupelem, event) {
            if(!event) event = window.event;
            if(popupelem) {
                var header = popupelem.parentNode.parentNode;
                var popup = header.parentNode;
                var popupid = popup.id;
                var model = $KG.allforms[popup.id];

                popupelem.src = $KU.getImageURL(model.titlebarconfig.minicon);
                popupelem.title = 'Minimize';
                popupelem.onclick = function(event) {
                    if(!event) event = window.event;
                    module.minimize(this, event);
                };
                var popupContainer = model.ismodal ? popup : popup.parentNode;
                popup.children[1].style.display = "block";
                popupContainer.style.bottom = '';
                popupContainer.style.right = '';

                module.dockedpopups = module.dockedpopups || {};
                if(module.dockedpopups[popupid]) {
                    var model = module.dockedpopups[popupid];
                    delete module.dockedpopups[popupid];
                    if(model.drag) {
                        model.drag.addDrag();
                    }
                    popupContainer.style.width = model.width;
                    popupContainer.style.top = model.position[0];
                    popupContainer.style.left = model.position[1];
                }

                popupContainer.style.overflow = "auto";
                module.undockedpopups = module.undockedpopups || {};
                module.undockedpopups[popupid] = model;

                popupContainer.style["z-index"] = ++module.zindex;
                this.updateMinimizePositions(model);
                if(model.resizable)
                    $KU.getElementById(model.id + "_resizearea").style.display = "";
                model.isMinimized = false;
            }
        },

        close: function(popupelem, event) {
            if(popupelem) {
                var popupid = popupelem.getAttribute("id");
                popupid = popupid.substr(popupid.indexOf("_") + 1);
                var model = $KG.allforms[popupid];
                this.dismiss(model);
            }
        },

        dragEvent: function(dragObj, eventType) {
            var popup = dragObj.widget;
            switch(eventType) {
                case $KW.touch.events.touchstart:
                    if(popup.style["z-index"] < module.zindex)
                        popup.style["z-index"] = ++module.zindex;
                    break;
                case $KW.touch.events.touchmove:
                    break;
                case $KW.touch.events.touchend:
                    break;
                case $KW.touch.events.touchcancel:
                    break;
            }
        },

        updateMinimizePositions: function(model) {
            if(module.dockedpopups) {
                var i = 1;
                var bottom = 20;
                for(var popupid in module.dockedpopups) {
                    var popupContainer = $KU.getElementById(popupid + "_container");
                    popupContainer = model.ismodal ? popupContainer.childNodes[1] : popupContainer;
                    if(popupContainer) {
                        popupContainer.style.top = '';
                        popupContainer.style.left = '';
                        popupContainer.style.right = '20px';
                        if(i > 1) {
                            bottom += popupContainer.offsetHeight + 5;
                        }
                        popupContainer.style.bottom = bottom + 'px';
                        i++;
                    }
                }
            }
        },

        generatePopupHeader: function(popupModel) {
            var htmlString = "";
            var config = popupModel.titlebarconfig;
            if(popupModel.title || (config && (config.minicon || config.maxicon || config.closeicon))) {
                
                htmlString = "<div kwidgettype='Popup_Header' kformname='" + popupModel.id + "' id='" + popupModel.id + "_titlebar' class='popupheader " + ((config && config.skin) || "") + "' style='position:relative;padding: 5px;text-align:left;'>";
                if(popupModel.title)
                    htmlString += "<label style='width:100%'>" + popupModel.title + "</label>";
                if(config && (config.minicon || config.maxicon || config.closeicon)) {
                    htmlString += "<div class='popupcontrols' style='padding: 5px;'><img src='" + $KU.getImageURL(config.minicon) + "' onclick='$KW.Popup.minimize(this,event)' id='minmax_" + popupModel.id + "' title='Minimize'>" + "<img src='" + $KU.getImageURL(config.closeicon) + "' onclick='$KW.Popup.close(this,event)' id='close_" + popupModel.id + "' title='Close'></div>";
                }
                htmlString += "</div>";
            }
            return htmlString;
        },

        
        adjustPopupDim: function(popupModel) {
            
            var header = $KU.getElementById(popupModel.id + "_titlebar"); 
            if(header) {
                var popupBody = $KU.getElementById(popupModel.id + "_body");
                var popupContainer = $KU.getElementById(popupModel.id + "_container");
                popupBody.style.height = 'auto';
                var padding = parseInt($KU.getStyle(popupBody, "padding-top").replace("px", ""), 10) + parseInt($KU.getStyle(popupBody, "padding-bottom").replace("px", ""), 10);
                var pHeight = popupContainer.offsetHeight - padding - header.offsetHeight - (popupModel.resizable ? 13 : 0);
                popupBody.style.height = pHeight + "px";
            }
        },
        applyTransition: function(model, popupelem, endTrans) {
            var transitionDuration = (model.transitionduration && model.transitionduration >= 0) ? model.transitionduration : 1;

            var popupHeight = popupelem.offsetHeight;
            var popupWidth = popupelem.offsetWidth;
            var transtype = endTrans ? model.ptranOut : model.ptran;
            model.height = Math.floor(popupHeight + ((window.innerHeight - popupHeight) / 2)); 
            model.width = Math.floor(popupWidth + ((window.innerWidth - popupWidth) / 2));

            if(transtype == "rightCenter") {
                model.width = screen.width + popupWidth;
            }
            if(transtype == "bottomCenter") {
                model.height = screen.height + popupHeight;
            }
            popupelem.style[$KU.animationDuration] = transitionDuration + "s";
            popupelem.parentNode.style.width = document.getElementsByTagName("body")[0].style.width;
            this.setAnchorPosition(model, popupelem, endTrans);

            var konyStyleSheetIndex = $KW.skins.getKonyStyleSheetIndex(document.styleSheets);
            var lastSheet = document.styleSheets[konyStyleSheetIndex];
            if(kony.appinit.useTransition) {
                if(transtype) {
                    var event = "AnimationEnd";
                    if(kony.appinit.isFirefox || $KU.isIE11)
                        event = event.toLowerCase();
                    else
                        event = $KU.animationEnd;
                    kony.events.addEventListener(popupelem, event, module.animationEnd(model.id, !!endTrans));
                }
                switch(transtype) {
                    case 'topCenter':
                    case 'bottomCenter':
                        var topY = (transtype == "topCenter") ? ("-" + model.height) : model.height;
                        if(endTrans) {
                            lastSheet.insertRule("@" + $KU.cssPrefix + "keyframes " + model.id + "endanimation { from { " + $KU.cssPrefix + "transform: translateY(0px); } to {" + $KU.cssPrefix + "transform: translateY( " + topY + "px);} }", lastSheet.cssRules.length);
                            popupelem.style[$KU.animationName] = model.id + "endanimation";
                        } else {
                            lastSheet.insertRule("@" + $KU.cssPrefix + "keyframes " + model.id + "animation { from { " + $KU.cssPrefix + "transform: translateY( " + topY + "px); } to {" + $KU.cssPrefix + "transform: translateY(0px);} }", lastSheet.cssRules.length);
                            popupelem.style[$KU.animationName] = model.id + "animation";
                        }
                        break;

                    case 'leftCenter':
                    case 'rightCenter':
                        var rightX = (transtype == "leftCenter") ? ("-" + model.width) : model.width;
                        if(endTrans) {
                            lastSheet.insertRule("@" + $KU.cssPrefix + "keyframes " + model.id + "endanimation { from { " + $KU.cssPrefix + "transform: translateX( 0px); } to {" + $KU.cssPrefix + "transform: translateX(" + rightX + "px);} }", lastSheet.cssRules.length);
                            popupelem.style[$KU.animationName] = model.id + "endanimation";
                        } else {
                            lastSheet.insertRule("@" + $KU.cssPrefix + "keyframes " + model.id + "animation { from { " + $KU.cssPrefix + "transform: translateX( " + rightX + "px); } to {" + $KU.cssPrefix + "transform: translateX(0px);} }", lastSheet.cssRules.length);
                            popupelem.style[$KU.animationName] = model.id + "animation";
                        }
                        break;
                    case 'fadeAnimation':
                        if(endTrans) {
                            popupelem.style[$KU.animationName] = $KW.formEndTransitionsMatrix[transtype];
                        } else {
                            popupelem.style[$KU.animationName] = $KW.formTransitionsMatrix[transtype];
                        }
                        break;
                    case 'slidedown':
                        if(endTrans) {
                            lastSheet.insertRule("@" + $KU.cssPrefix + "keyframes " + model.id + "endanimation { from {height:" + popupHeight + "px;} to {height:0px;} }", lastSheet.cssRules.length);
                            popupelem.style[$KU.animationName] = model.id + "endanimation";
                        } else {
                            popupelem.style.overflow = "hidden";
                            lastSheet.insertRule("@" + $KU.cssPrefix + "keyframes " + model.id + "animation { from {height:0px;} to {height:" + popupHeight + "px;} }", lastSheet.cssRules.length);
                            popupelem.style[$KU.animationName] = model.id + "animation";
                        }
                        break;
                }
            } else {
                var context = model.context;
                var widget = context && context.widget;
                var elem = $KU.getNodeByModel(widget);

                switch(transtype) {
                    case 'topCenter':
                        if(endTrans) {
                            $("#" + popupelem.id).animate({
                                "top": +(-popupHeight) + "px"
                            }, transitionDuration * 1000, function() {
                                module.domremove(model.ismodal ? popupelem : popupelem.childNodes[0]);
                            });
                        } else {
                            var calcCenter = popupelem.style.top;
                            if(!elem)
                                calcCenter = $(window).height() / 2 - popupHeight / 2;
                            popupelem.style.top = -popupHeight + "px";
                            $("#" + popupelem.id).animate({
                                "top": calcCenter
                            }, transitionDuration * 1000);
                        }
                        break;
                    case 'bottomCenter':
                        if(endTrans) {
                            $("#" + popupelem.id).animate({
                                "top": +($(window).height() + popupHeight) + "px"
                            }, transitionDuration * 1000, function() {
                                module.domremove(model.ismodal ? popupelem : popupelem.childNodes[0]);
                            });
                        } else {
                            var calcCenter = popupelem.style.top;
                            if(!elem)
                                calcCenter = $(window).height() / 2 - popupHeight / 2;
                            popupelem.style.top = $(window).height() + popupHeight + "px";
                            $("#" + popupelem.id).animate({
                                "top": calcCenter
                            }, transitionDuration * 1000);
                        }
                        break
                    case 'leftCenter':
                        if(model.context) {
                            var anchorPos = $KU.getAnchorPosition(model, popupelem);
                            if(endTrans) {
                                $("#" + popupelem.id).animate({
                                    "left": +(-popupWidth) + "px"
                                }, transitionDuration * 1000, function() {
                                    module.domremove(model.ismodal ? popupelem : popupelem.childNodes[0]);
                                });
                            } else {
                                popupelem.style.left = -popupWidth + "px";
                                $("#" + popupelem.id).animate({
                                    "left": +(anchorPos.leftPos) + "px"
                                }, transitionDuration * 1000);

                            }
                        } else {
                            if(endTrans) {
                                $("#" + popupelem.id).animate({
                                    "left": +(-popupWidth) + "px"
                                }, transitionDuration * 1000, function() {
                                    module.domremove(model.ismodal ? popupelem : popupelem.childNodes[0]);
                                });
                            } else {
                                popupelem.style.left = -popupWidth + "px";
                                var calcCenter = $(window).width() / 2 - popupWidth / 2;
                                $("#" + popupelem.id).animate({
                                    "left": +(calcCenter) + "px"
                                }, transitionDuration * 1000);
                            }
                        }
                        break;
                    case 'rightCenter':
                        if(model.context) {
                            var anchorPos = $KU.getAnchorPosition(model, popupelem);
                            if(endTrans) {
                                $("#" + popupelem.id).animate({
                                    "left": +($(window).width() + popupWidth) + "px"
                                }, transitionDuration * 1000, function() {
                                    module.domremove(model.ismodal ? popupelem : popupelem.childNodes[0]);
                                });
                            } else {
                                popupelem.style.left = $(window).width() + popupWidth + "px";
                                $("#" + popupelem.id).animate({
                                    "left": +(anchorPos.leftPos) + "px"
                                }, transitionDuration * 1000);
                            }
                        } else {
                            if(endTrans) {
                                $("#" + popupelem.id).animate({
                                    "left": +($(window).width() + popupWidth) + "px"
                                }, transitionDuration * 1000, function() {
                                    module.domremove(model.ismodal ? popupelem : popupelem.childNodes[0]);
                                });
                            } else {
                                popupelem.style.left = $(window).width() + popupWidth + "px";
                                var calcCenter = $(window).width() / 2 - popupWidth / 2;
                                $("#" + popupelem.id).animate({
                                    "left": +(calcCenter) + "px"
                                }, transitionDuration * 1000);

                            }
                        }
                        break;
                    case 'fadeAnimation':
                        if(endTrans) {
                            $("#" + popupelem.id).fadeOut(transitionDuration * 1000, function() {
                                module.domremove(model.ismodal ? popupelem : popupelem.childNodes[0]);
                            });
                        } else {
                            $("#" + popupelem.id).hide().fadeIn(transitionDuration * 1000);
                        }
                        break;
                    case 'slidedown':
                        if(endTrans) {
                            $("#" + popupelem.id).animate({
                                height: "toggle"
                            }, transitionDuration * 1000, function() {
                                module.domremove(model.ismodal ? popupelem : popupelem.childNodes[0]);
                            });
                        } else {
                            popupelem.style.overflow = "hidden";
                            popupelem.style.height = "0px";
                            $("#" + popupelem.id).animate({
                                height: popupHeight + "px"
                            }, transitionDuration * 1000);
                        }
                        break;
                }
            }
            if(model.ismodal)
                popupelem.parentNode.style.visibility = "visible";
            else
                popupelem.style.visibility = "visible";

            
            if(!transtype) {
                popupelem.tabIndex = -1;
                popupelem.focus();
            }
            
            
            if(!transtype || transtype == "None") {
                popupelem.tabIndex = -1;
                popupelem.focus();
            }
            $KW.touch.computeSnapWidths(model.id, "Segment");
        },

        setAnchorPosition: function(model, popupelem, endTrans) {
            var context = model.context;
            if(context && context.widget) {
                if(model.enableScroll && !model.ismodal) {
                    popupelem = popupelem.parentNode;
                }
                var widget = context.widget;
                var elem;
                if(widget.wType == "Form") {
                    elem = document.getElementById(widget.id);
                } else {
                    elem = $KU.getNodeByModel(widget);
                }
                if(elem && widget.wType != "Form") {
                    var scroller = $KU.getElementById(model.id + "_scroller");
                    var popupHeight = model.enableScroll && model.ismodal ? scroller.offsetHeight : popupelem.offsetHeight;
                    var popupWidth = popupelem.offsetWidth;
                    var transtype = !endTrans ? (model.ptran) : (model.ptranOut);

                    var pos = $KU.getPosition(elem, model);
                    
                    var elmViewportTop = pos.top;
                    var elmViewportBottom;
                    var anchorPos = $KU.getAnchorPosition(model, popupelem);
                    var winInnerHeight = window.innerHeight;
                    var docBodyclientHeight = document.body.clientHeight;
                    var bodyHeight = winInnerHeight || docBodyclientHeight;
                    if(typeof winInnerHeight === 'number' && typeof docBodyclientHeight === 'number') {
                        bodyHeight = Math.max(winInnerHeight, docBodyclientHeight);
                    }

                    if(context["anchor"] == "bottom") {
                        popupelem.style.left = anchorPos.leftPos + 'px';
                        elmViewportBottom = elmViewportTop + elem.clientHeight; 
                            if(context["isenabled"] == true && elmViewportTop == 0) {
                                popupelem.style.top = 0;
                                model.height = (transtype == "bottomCenter") ? (popupHeight + bodyHeight - elmViewportBottom) : (popupHeight + elmViewportBottom);
                            } else if(bodyHeight == elmViewportBottom) { 
                                popupelem.style.bottom = "0px";
                                model.height = (transtype == "bottomCenter") ? popupHeight : (popupHeight + elmViewportBottom); 
                            } else if(bodyHeight - elmViewportBottom > popupHeight) { 
                                popupelem.style.top = elmViewportBottom + "px";
                                model.height = (transtype == "bottomCenter") ? (popupHeight + bodyHeight - elmViewportBottom) : (popupHeight + elmViewportBottom);
                            } else if(elmViewportTop > popupHeight) { 
                                popupelem.style.top = (elmViewportTop - popupHeight) + "px";
                                model.height = (transtype == "bottomCenter") ? (popupHeight + bodyHeight - elmViewportTop) : (popupHeight + elmViewportTop);
                            } else { 

                                popupelem.style.top = Math.floor((100 - Math.floor((popupHeight * 100) / popupelem.parentNode.offsetHeight)) / 2) + "%";
                            }
                    }
                    if(context["anchor"] == "top") {
                        popupelem.style.left = anchorPos.leftPos + 'px';
                        
                        if(!elmViewportTop) {
                            popupelem.style.top = 0;
                        } else if(elmViewportTop > popupHeight) {
                            popupelem.style.top = (elmViewportTop - popupHeight) + "px";
                            model.height = (transtype == "bottomCenter") ? (popupHeight + bodyHeight - elmViewportTop) : (popupHeight + elmViewportTop);
                        } else { 
                            popupelem.style.top = Math.floor((100 - Math.floor((popupHeight * 100) / popupelem.parentNode.offsetHeight)) / 2) + "%";
                        }
                    }
                    if(context["anchor"] == "left" || context["anchor"] == "right") {
                        popupelem.style.top = anchorPos.topPos + 'px';
                        popupelem.style.left = anchorPos.leftPos + 'px';
                    }
                } else if(elem && widget.wType == "Form") {
                    if(!$KG.nativeScroll && document.getElementById(elem.id + "_scroller")) {
                        var pos = $KU.getPosition(document.getElementById(elem.id + "_scroller"));
                        } else {
                            var pos = $KU.getPosition(elem);
                        }
                        var elmViewportTop = pos.top;
                        var elmViewportBottom = elmViewportTop + pos.height;
                        var scroller = $KU.getElementById(model.id);
                        var popupHeight = scroller.offsetHeight; 
                        var popupWidth = scroller.offsetWidth; 
                        var transtype = !endTrans ? (model.ptran) : (model.ptranOut);

                        if(context["anchor"] == "bottom") {
                            if($KG.nativeScroll) {
                                popupelem.style.top = (document.body.querySelector('form').offsetHeight - popupHeight) + "px";
                            } else {
                                popupelem.style.top = (window.innerHeight - popupHeight) + "px";
                            }
                            popupelem.style.left = "0px";
                            model.height = (transtype == "bottomCenter") ? (popupHeight + bodyHeight - elmViewportBottom) : (popupHeight + elmViewportBottom)
                        }

                        if(context["anchor"] == "top") {
                            popupelem.style.top = "0px";
                            popupelem.style.left = "0px";
                            model.height = (transtype == "bottomCenter") ? (popupHeight + bodyHeight - elmViewportTop) : (popupHeight + elmViewportTop);
                        }
                        if(context["anchor"] == "left") {
                            popupelem.style.top = "0px";
                            popupelem.style.left = "0px";
                        }

                        if(context["anchor"] == "right") {
                            popupelem.style.top = "0px";
                            popupelem.style.right = "0px";
                        }
                    }
                    popupelem.style.position = "absolute";
                }
        },

        adjustPopupDimensions: function(model, popupelem) {
            if(!document.getElementById(popupelem.id)) return;

            var popupContainer = $KU.getElementById(model.id + "_container");
            $KU.setScrollHeight(model, model.ismodal ? popupContainer.childNodes[1] : popupContainer);
            if(!model.context) {
                module.adjustPosition(model, popupelem);
            }

            module.setAnchorPosition(model, popupelem);

            
            if($KG["nativeScroll"] && model.ismodal) {
                var __popuplayer = popupelem.previousSibling;
                var mainContainerHeight = document.getElementById("__MainContainer").clientHeight;
                if(mainContainerHeight < (window.innerHeight || document.body.clientHeight))
                    __popuplayer.style.height = (window.innerHeight || document.body.clientHeight) + "px";
                else
                    __popuplayer.style.height = mainContainerHeight + "px";
            }
            var scrollInstance = $KG[model.id + "_scroller"];
            scrollInstance && scrollInstance.refresh();
        },

        adjustPosition: function(popupModel, popupelem) {
            var elem = popupModel.ismodal ? popupelem : popupelem.parentNode;
            if($KG.nativeScroll) {
                popupelem.parentNode.style.position = "fixed";
            }
            var contentNode = popupModel.ismodal ? popupelem : popupelem.parentNode;
            var screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            var screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

            var top = Math.floor((100 - Math.floor((contentNode.offsetHeight * 100) / screenHeight)) / 2) + "%";
            var left = Math.floor((100 - Math.floor((contentNode.offsetWidth * 100) / screenWidth)) / 2) + "%";
            
            if(parseInt(top, 10) < 0)
                elem.style.top = 0;
            else
                elem.style.top = top;

            elem.style.left = left;
        },

        animationEnd: function(id, endTrans) {
            return function() {
                var event = "AnimationEnd";
                if(kony.appinit.isFirefox || $KU.isIE11)
                    event = event.toLowerCase();
                else
                    event = $KU.animationEnd;
                var popupelem = $KU.getElementById(id);
                var model = $KG.allforms[id];
                
                if(!popupelem) return;
                popupelem = model.ismodal ? popupelem : popupelem.parentNode;
                kony.events.removeEventListener(popupelem, event, arguments.callee);
                if(popupelem && endTrans) {
                    module.domremove(model.ismodal ? popupelem : popupelem.childNodes[0]);
                    popupelem.style[$KU.animationName] = "";
                }

                
                var className = endTrans ? id + "endanimation" : id + "animation";
                var styleSheetIndex = $KW.skins.getKonyStyleSheetIndex(document.styleSheets);
                var lastSheet = document.styleSheets[styleSheetIndex];
                var index = lastSheet.cssRules.length - 1;
                if(lastSheet.cssRules[index] && lastSheet.cssRules[index].name == className) {
                    if(lastSheet.deleteRule)
                        lastSheet.deleteRule(index);
                    else
                        lastSheet.removeRule(index);
                }
                
                
                if(!endTrans || endTrans == "None") {
                    popupelem.tabIndex = -1;
                    popupelem.focus();
                }
            };
        },

        setcontext: function(popupModel, context) {
            if(popupModel instanceof Object && context instanceof Object) {
                popupModel.context = context;
            }
        },

        add: function() {
            var formmodel = arguments[0];
            if("add" in formmodel) {
                var widarray = [].slice.call(arguments, 1);
                formmodel.add(widarray)
            }
        },

        addAt: function(popupModel, widgetref, index) {
            if(widgetref == null) return;
            popupModel.addAt && popupModel.addAt(widgetref, index);
        },

        widgets: function(popupModel) {
            if(popupModel.widgets) return popupModel.widgets();
        },

        remove: function(popupModel, widgetref) {
            popupModel.remove && popupModel.remove(widgetref);
        },

        removeAt: function(popupModel, index) {
            popupModel.removeAt && popupModel.removeAt(index);
        },

        scrollToBeginning: function(popupModel) {
            var popupBody;
            var header = $KU.getElementById(popupModel.id + "_titlebar");
            if(header)
                popupBody = $KU.getElementById(popupModel.id + "_body");
            else
                popupBody = popupModel.ismodal ? $KU.getElementById(popupModel.id) : $KU.getElementById(popupModel.id + "_container")
            popupBody && $KW.Utils.animateY(popupBody.scrollTop, 0, popupBody.id);
        },

        scrollToEnd: function(popupModel) {
            var popupBody;
            var header = $KU.getElementById(popupModel.id + "_titlebar");
            if(header)
                popupBody = $KU.getElementById(popupModel.id + "_body");
            else
                popupBody = popupModel.ismodal ? $KU.getElementById(popupModel.id) : $KU.getElementById(popupModel.id + "_container")
            popupBody && $KW.Utils.animateY(popupBody.scrollTop, popupBody.scrollHeight, popupBody.id);
        },

        scrollToWidget: function(popupref, widgetref) {
            $KW.APIUtils.setfocus(widgetref, popupref);
        },

        handleshow: function(popupModel) {
            if("show" in popupModel)
                popupModel.show();
        },

        destroy: function(model) {
            if("destroy" in model)
                model.destroy(model);
        },
        dismissPopup: function(pf, eventObject) {
            
            if(eventObject && !pf) {
                var currentTarget = eventObject.target || eventObject.srcElement;
                var popupNode = $KU.getParentByAttributeValue(currentTarget, "name", "nonmodalpopup");
                if(popupNode)
                    pf = popupNode.getAttribute("kformname");
            }
            
            
            
            
            if(!pf || (window[pf] && window[pf].wType != "Popup")) {
                var popups = document.querySelectorAll("div[name='nonmodalpopup']");
                for(var i = 0; i < popups.length; i++) {
                    var popup = popups[i].childNodes[0];
                    var model = window[popup.id];
                    if(model.minimizeonlostfocus) {
                        module.minimize(document.getElementById("minmax_" + popup.id), eventObject);
                        
                    } else if(model && !model.retaindisplayonlostfocus) {
                        module.dismiss(model);
                        return true;
                    }

                }
            } else {
                var popupContainer = document.getElementById(pf + "_container");
                if(popupContainer && module.zindex)
                    popupContainer.style["z-index"] = ++module.zindex;
            }
            return false;
        }
    };


    return module;
}());
