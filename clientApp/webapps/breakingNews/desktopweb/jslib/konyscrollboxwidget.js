
$KW.ScrollBox = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "ScrollBox", this.eventHandler);
            kony.events.addEvent("onorientationchange", "ScrollBox", this.adjustBoxDimensions);
        },

        initializeView: function(formId) {
            this.adjustBoxDimensions(formId);
        },

        
        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            switch(propertyName) {
                case "totalWt":
                    if(widgetModel.orientation == constants.BOX_LAYOUT_HORIZONTAL) {
                        var box = $KU.getNodeByModel(widgetModel);
                        box && this.adjustScrollBoxWidth(widgetModel, box);
                    }
                    break;
                case "showscrollbars":
                    var box = $KU.getNodeByModel(widgetModel);
                    module.addRemoveMouseWheelScroll(widgetModel, box);
                    break;
            }
        },

        render: function(widgetModel, context) {
            var htmlString = "";
            if(widgetModel.orientation == constants.BOX_LAYOUT_HORIZONTAL)
                htmlString = kony.widgets.ScrollBox.renderHBox(widgetModel, context);
            else 
                htmlString = kony.widgets.ScrollBox.renderVBox(widgetModel, context);

            return htmlString;
        },

        
        renderHBox: function(boxModel, context) {
            var parentModel = kony.model.getWidgetModel(boxModel.pf, context.tabpaneID);
            var htmlString = "";
            var layoutDirection = kony.widgets.skins.getWidgetAlignmentSkin(boxModel);
            var wID = boxModel.pf + "_" + boxModel.id;
            var computedSkin = "";
            var topLevel = context.topLevelBox;
            var boxStyle = kony.widgets.skins.getMarginSkin(boxModel, context) + kony.widgets.skins.getPaddingSkin(boxModel);
            var cellWidth = "";

            if(!topLevel) {
                htmlString += "<div class = 'krow kwt100' >";
                htmlString += "<div class = 'kcell kwt100' >";
            }
            computedSkin = kony.widgets.skins.getWidgetSkinList(boxModel, context);

            
            var scrolldirection = kony.widgets.stringifyScrolldirection[boxModel.scrolldirection];
            var style = (scrolldirection == "both") ? "overflow:auto;" : (scrolldirection == "horizontal" ? "overflow-x:auto;overflow-y:hidden;" : scrolldirection == "vertical" ? "overflow-y:auto;overflow-x:hidden;" : scrolldirection == "none" ? "overflow:hidden;" : "");
            htmlString += "<div style='" + style + boxStyle + "' class ='" + computedSkin + "'" + kony.widgets.Utils.getBaseHtml(boxModel, context) + " swipeDirection='" + scrolldirection + "'>";

            if(boxModel.percent == true)
                htmlString += "<div style='table-layout:fixed;" + (boxModel.totalWt ? "width:" + boxModel.totalWt + "%" : "") + "' class = 'ktable'>";
            else
                htmlString += "<div style='table-layout:fixed; width:100%; ' class = 'ktable'>";
            htmlString += "<div class = 'krow " + layoutDirection + " kwt100' >";

            if(!boxModel.children || boxModel.children.length == 0) {
                htmlString += "</div></div></div>";
                if(!topLevel) {
                    htmlString += "</div></div>";
                }
                return htmlString;
            }

            for(var i = 0; i < boxModel.children.length; i++) {
                var childModel = parentModel[boxModel.children[i]];
                if(childModel.wType == "HBox" || childModel.wType == "VBox" || childModel.wType == "ScrollBox") {
                    context.topLevelBox = false;
                    if(childModel.wType == "HBox") {
                        htmlString += kony.widgets["HBox"].render(childModel, context);
                    } else {
                        htmlString += kony.widgets["VBox"].render(childModel, context);
                    }
                } else {
                    
                    if(boxModel.percent == true) {
                        context.ispercent = true;
                        
                        if(boxModel.totalWt && kony.appinit.isIE) 
                            cellWidth = Math.floor((100 * childModel.containerweight) / boxModel.totalWt);
                        else
                            cellWidth = childModel.containerweight;

                        $KW.skins.addWidthRule(cellWidth);
                        var containerWt = "";
                        if(childModel.containerweight)
                            containerWt = "kwt" + cellWidth;
                        else
                            containerWt = "auto";
                        
                        var alignment = kony.widgets.skins.getWidgetAlignmentSkin(childModel);
                        htmlString += "<div class = 'kcell " + containerWt + " " + alignment + "' style='" + $KW.skins.getChildMarginAsPaddingSkin(childModel) + "' >";
                    } else {
                        context.ispercent = false;
                    }
                    htmlString += kony.widgets[childModel.wType].render(childModel, context);
                    if(boxModel.percent == true) {
                        htmlString += "</div>";
                    }

                }
            }
            
            if($KG.appbehaviors.adherePercentageStrictly == true && boxModel.percent === true) {
                boxModel.dummyNodeWidth = $KW.HBox.getExtraNodeWidth(boxModel);
                htmlString += "<div class = 'kcell kwt" + boxModel.dummyNodeWidth + "'  ></div>";
            }

            htmlString += "</div></div>";
            htmlString += "</div>";
            if(!topLevel) {
                htmlString += "</div></div>";
            }

            return htmlString;
        },

        
        renderVBox: function(boxModel, context) {
            var parentModel = kony.model.getWidgetModel(boxModel.pf, context.tabpaneID);
            var topLevelBox = context.topLevelBox;
            var layoutDirection = kony.widgets.skins.getWidgetAlignmentSkin(boxModel);
            var htmlString = "";
            var wID = boxModel.pf + "_" + boxModel.id;
            var computedSkin = kony.widgets.skins.getWidgetSkinList(boxModel, context);
            var boxStyle = kony.widgets.skins.getMarginSkin(boxModel, context) + kony.widgets.skins.getPaddingSkin(boxModel);

            
            var scrolldirection = kony.widgets.stringifyScrolldirection[boxModel.scrolldirection];
            var style = (scrolldirection == "both") ? "overflow:auto;" : (scrolldirection == "horizontal" ? "overflow-x:auto;overflow-y:hidden;" : scrolldirection == "vertical" ? "overflow-y:auto;overflow-x:hidden;" : scrolldirection == "none" ? "overflow:hidden;" : "");
            htmlString += "<div style='" + style + boxStyle + "' swipeDirection='" + scrolldirection + "'" + kony.widgets.Utils.getBaseHtml(boxModel, context) + " class ='" + computedSkin + "' >";
            htmlString += "<div id='" + wID + "_scrollee'>";

            htmlString += "<div class = 'ktable kwt100'>";
            var len = boxModel.children ? boxModel.children.length : 0;
            for(var i = 0; i < len; i++) {
                var childModel = parentModel[boxModel.children[i]];
                if(childModel.wType == "HBox" || childModel.wType == "VBox" || childModel.wType == "ScrollBox") {
                    context.topLevelBox = false;
                    if(childModel.wType == "HBox") {
                        context.ispercent = boxModel.percent;
                        htmlString += kony.widgets["HBox"].render(childModel, context);
                    } else {
                        htmlString += kony.widgets["VBox"].render(childModel, context);
                    }
                } else {
                    htmlString += "<div class = 'krow kwt100'>";
                    layoutDirection = kony.widgets.skins.getWidgetAlignmentSkin(childModel);
                    vboxComputedSkin = kony.widgets.skins.getMarAdjustedContainerWeightSkin(childModel, "100");
                    vboxComputedSkin += " " + layoutDirection;
                    htmlString += "<div class = 'kcell " + vboxComputedSkin + "' >";
                    htmlString += kony.widgets[childModel.wType].render(childModel, context);
                    htmlString += "</div></div>";
                }
            }

            htmlString += "</div>";
            htmlString += "</div></div>";
            return htmlString;
        },

        eventHandler: function(eventObject, target, sourceFormID) {
            var boxWidgetModel = kony.utils.getModelByNode(target);
            
            target.getAttribute("kcontainerID") && kony.widgets.Utils.updateContainerData(boxWidgetModel, target, !boxWidgetModel.onclick);
            boxWidgetModel.onclick && kony.app[boxWidgetModel.onclick](boxWidgetModel);
        },

        adjustBoxDimensions: function(formId) {
            var scrollBoxes = document.querySelectorAll("#" + formId + " div[kwidgettype='ScrollBox']");
            for(var i = 0; i < scrollBoxes.length; i++) {
                var scrollDir = scrollBoxes[i].getAttribute("swipeDirection");
                var boxModel = kony.utils.getModelByNode(scrollBoxes[i]);
                
                if(scrollDir != "horizontal") {
                    $KU.setScrollHeight(boxModel, scrollBoxes[i]);
                }
                if(scrollDir != "none" && !boxModel.showscrollbars) {
                    kony.widgets.ScrollBox.addRemoveMouseWheelScroll(boxModel, scrollBoxes[i]);
                }
            }
        },

        addRemoveMouseWheelScroll: function(boxModel, scrollBox) {
            var scrollDir = kony.widgets.stringifyScrolldirection[boxModel.scrolldirection];

            if(scrollDir != "none") {

                if(!boxModel.showscrollbars) {
                    scrollBox.style.overflow = "hidden";
                    scrollBox.style.overflowX = "hidden";
                    scrollBox.style.overflowY = "hidden";

                    if(scrollBox.addEventListener) {
                        scrollBox.addEventListener("mousewheel", module.scrollContent, false);
                        scrollBox.addEventListener("DOMMouseScroll", module.scrollContent, false);
                    } else {
                        scrollBox.attachEvent("onmousewheel", module.scrollContent);
                    }
                } else {
                    if(scrollDir == "both") {
                        scrollBox.style.overflow = "auto";
                        scrollBox.style.overflowX = "auto";
                        scrollBox.style.overflowY = "auto";
                    }
                    if(scrollDir == "vertical") {
                        scrollBox.style.overflow = "auto";
                        scrollBox.style.overflowX = "hidden";
                        scrollBox.style.overflowY = "auto";
                    }
                    if(scrollDir === "horizontal") {
                        scrollBox.style.overflow = "auto";
                        scrollBox.style.overflowX = "auto";
                        scrollBox.style.overflowY = "hidden";
                    }
                    if(scrollBox.removeEventListener) {
                        scrollBox.removeEventListener("mousewheel", module.scrollContent, false);
                        scrollBox.removeEventListener("DOMMouseScroll", module.scrollContent, false);
                    } else {
                        scrollBox.detachEvent("onmousewheel", module.scrollContent);
                    }
                }
            }
        },

        scrollContent: function(e) {
            var e = window.event || e;
            var currenttWidget = e.target || e.srcElement;
            var targetWidget = $KU.closestElement(currenttWidget, 'kwidgettype', 'ScrollBox');
            if(targetWidget) {
                targetWidget.scrollTop = (targetWidget.scrollTop) - (Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))) * 75;
                kony.events.preventDefault(e);
            }
        },

        adjustDimensionsByNode: function(boxModel, scrollBox) {
            var boxhtPercent = boxModel.containerheight;

            var kht = "";
            if(boxhtPercent > 0) {
                if(boxModel.containerheightreference == 1) 
                {
                    var parentElementHeight = screen.availHeight;
                    kht = Math.round((boxhtPercent * parentElementHeight) / 100);
                } else if(boxModel.containerheightreference == 2) 
                {
                    var parentModel = $KU.getParentModel(boxModel);
                    var parent = $KU.getNodeByModel(parentModel);
                    var parentWidth = (parent && parent.offsetWidth) || screen.availWidth;
                    kht = Math.round((boxhtPercent * parentWidth) / 100);
                } else if(boxModel.containerheightreference == 3) 
                {
                    var parentWidth = screen.height;
                    kht = Math.round((boxhtPercent * parentWidth) / 100);
                }
            } else {
                if(boxModel.wType == "Map" || boxModel.wType == "Browser") {
                    kht = '500px';
                }
                if(boxModel.wType == "TabPane" || boxModel.wType == "Segment" || boxModel.wType == "Popup" || boxModel.wType == "ScrollBox") {
                    kht = 'auto';
                }
                if(boxModel.containerheight == 0) {
                    kht = 0;
                }
            }
            scrollBox.style.height = (kht != "auto") ? (kht + "px") : "auto";

            if(boxModel.containerheight && boxModel.wType != "ScrollBox") {
                scrollBox.style.overflow = 'auto';
            }
            if(boxModel.wType == "Popup" && boxhtPercent) {
                scrollBox.style.maxHeight = "";
                var popupTop = Number(window.getComputedStyle(scrollBox).top.replace("px", ""));
                var popupHeight = Number(window.getComputedStyle(scrollBox).height.replace("px", ""));
                if((popupTop + popupHeight) > screen.height) {
                    scrollBox.style.top = '0px';
                }
            }
        },

        adjustScrollBoxWidth: function(boxModel, boxNode) {
            if(boxModel.percent) {
                boxNode.firstChild.style.width = boxModel.totalWt + "%";
            }
        },

        adjustScrollChildrenWidth: function(boxModel, boxNode) {
            if(boxModel.percent && boxModel.totalWt) {
                if(kony.appinit.isIE) {
                    var row = boxNode.firstChild.firstChild;
                    var cells = row.childNodes;
                    var totalWidth = boxModel.totalWt || 0;
                    for(var i = 0; i < cells.length; i++) {
                        var childModel = boxModel[cells[i].firstChild.id.split("_")[1]];
                        var cellWt = Math.floor((100 * childModel.containerweight) / boxModel.totalWt);
                        var newWt = kony.widgets.skins.getMarAdjustedContainerWeightSkin(childModel, cellWt || "");
                        cells[i].className = cells[i].className.replace(new RegExp("(^|\\s+)kwt([0-9]+)(\\s+|$)"), ' ');
                        $KU.addClassName(cells[i], newWt);
                    }
                } else
                    boxNode.innerHTML = boxNode.innerHTML;
            }
        },

        fadeHImages: function(boxModel) {
            var style = "display:none;";
            var leftSrc = kony.widgets.Image.getImageURL(boxModel.leftarrowimage);
            var rightSrc = kony.widgets.Image.getImageURL(boxModel.rightarrowimage);
            var wID = boxModel.pf + "_" + boxModel.id;

            var str = "<div id='" + wID + "_scrollFades' class='scroll_view'>" +
                "<div id='" + wID + "_leftimg' class='scroll_fades leftfade' style='" + style + "'>" +
                "<img type='HImg' src='" + leftSrc + "' onload='kony.widgets.ScrollBox.setHeight(this)' >" +
                "</div>" +
                "<div id='" + wID + "_rightimg' class='scroll_fades rightfade' style='" + style + "'>" +
                "<img type='HImg' src='" + rightSrc + "' onload='kony.widgets.ScrollBox.setHeight(this)' >" +
                "</div>" +
                "</div>";
            return str;
        },

        fadeVImages: function(boxModel) {
            var style = "display:none;";
            var topSrc = kony.widgets.Image.getImageURL(boxModel.toparrowimage);
            var bottomSrc = kony.widgets.Image.getImageURL(boxModel.bottomarrowimage);
            var wID = boxModel.pf + "_" + boxModel.id;
            var str = "<div id='" + wID + "_scrollFades' class='scroll_view' style='height:inherit;'>" +
                "<div id='" + wID + "_topimg' class='scroll_fades topfade' style='" + style + "'>" +
                "<img type='VImg' src='" + topSrc + "' onload='kony.widgets.ScrollBox.setHeight(this)' >" +
                "</div>" +
                "<div id='" + wID + "_bottomimg' class='scroll_fades bottomfade' style='" + style + "'>" +
                "<img type='VImg' src='" + bottomSrc + "' onload='kony.widgets.ScrollBox.setHeight(this)' >" +
                "</div>" +
                "</div>";
            return str;
        },

        setHeight: function(src) {
            var parentDiv = src.parentNode;
            setTimeout(function() {
                parentDiv.style.height = src.height || src.naturalHeight;
                parentDiv.style.width = src.width || src.naturalWidth;
            }, 0);
            var type = src.getAttribute("type");
            if(type == 'HImg')
                parentDiv.style.top = Math.floor((parentDiv.parentNode.offsetHeight - src.naturalHeight) / 2) + "px";
            else
                parentDiv.style.left = Math.floor((parentDiv.parentNode.offsetWidth - src.naturalWidth) / 2) + "px";
        },

        adjustArrowPosition: function(node) {
            var type = node.firstChild.childNodes[0].getAttribute("type");
            if(type == 'HImg')
                node.firstChild.style.top = node.lastChild.style.top = Math.floor((node.offsetHeight - node.firstChild.childNodes[0].naturalHeight) / 2) + "px";
            else
                node.firstChild.style.left = node.lastChild.style.left = Math.floor((node.offsetWidth - node.firstChild.childNodes[0].naturalWidth) / 2) + "px";
        },

        recalculateScrollBoxWidth: function(boxModel) {
            if(boxModel.orientation != constants.BOX_LAYOUT_HORIZONTAL)
                return;

            var children = boxModel.ownchildrenref;
            var totalWt = 0;
            for(var i = 0; i < children.length; i++) {
                totalWt += children[i].containerweight;
            }

            boxModel.totalWt = totalWt;

            var boxNode = $KU.getNodeByModel(boxModel);
            if(boxNode == null)
                return;
            boxNode.firstChild.style.width = totalWt + "%";
        }
    };


    return module;
}());
