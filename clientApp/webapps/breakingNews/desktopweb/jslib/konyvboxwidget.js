
$KW.VBox = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "VBox", this.eventHandler);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            
        },

        render: function(vBoxModel, context) {
            if(vBoxModel.layouttype == constants.CONTAINER_LAYOUT_GRID) {
                return $KW.Grid.render(vBoxModel, context);
            }

            if(!context.renderingTabHeader) {
                var parentModel = vBoxModel.parent;
            } else {
                
                var parentModel = kony.model.getWidgetModel(context.pf, context.tabpaneID);
                parentModel = parentModel[context.tabID]["header"];
            }

            var topLevelBox = context.topLevelBox;
            var layoutDirection = $KW.skins.getWidgetAlignmentSkin(vBoxModel);
            var htmlString = "";
            var boxstyle = " " + $KW.skins.getBaseStyle(vBoxModel, context);

            var visibleClass = $KW.skins.getVisibilitySkin(vBoxModel);


            if(topLevelBox) {
                var vboxComputedSkin = $KW.skins.getWidgetSkinList(vBoxModel, context);

                htmlString += "<div class = 'ktable " + vboxComputedSkin + " " + visibleClass + "'" + $KW.Utils.getBaseHtml(vBoxModel, context) + " style='" + boxstyle + "'>";

            } else {
                var cwt = vBoxModel.containerweight;
                if(parentModel && parentModel.wType == "ScrollBox" && parentModel.totalWt && kony.appinit.isIE)
                    cwt = Math.floor((100 * cwt) / parentModel.totalWt);

                $KW.skins.addWidthRule(cwt);
                var vboxComputedSkin = "kwt" + cwt + " " + layoutDirection;
                htmlString += "<div class = ' kcell " + vboxComputedSkin + "' style='" + $KW.skins.getChildMarginAsPaddingSkin(vBoxModel) + "' >";
                
                
                vboxComputedSkin = $KW.skins.getWidgetSkinList(vBoxModel, context);

                htmlString += "<div class = 'ktable " + vboxComputedSkin + " " + visibleClass + "'" + $KW.Utils.getBaseHtml(vBoxModel, context) + " style='" + boxstyle + "'>";
            }

            var len = vBoxModel.children ? vBoxModel.children.length : 0;
            for(var i = 0; i < len; i++) {
                var childModel = vBoxModel[vBoxModel.children[i]];
                if(childModel.wType === "HBox" || childModel.wType === "VBox" || childModel.wType === "ScrollBox") {
                    context.topLevelBox = false;
                    if(childModel.wType == "HBox") context.ispercent = vBoxModel.percent;
                    htmlString += $KW[childModel.wType].render(childModel, context);
                } else {
                    context.ispercent = true;
                    htmlString += "<div class = ' krow kwt100' >";
                    layoutDirection = $KW.skins.getWidgetAlignmentSkin(childModel);
                    vboxComputedSkin = "kcell kwt100 " + layoutDirection + (childModel.wType == 'TPW' ? ' konycustomcss' : '');
                    htmlString += "<div class = '" + vboxComputedSkin + "' >";
                    htmlString += $KW[childModel.wType].render(childModel, context);
                    htmlString += "</div></div>";
                }

            }
            htmlString += "</div>";
            if(!topLevelBox) {
                htmlString += "</div>";
            }
            return htmlString;
        },

        eventHandler: function(eventObject, target) {
            $KW.HBox.eventHandler(eventObject, target);
        }
    };


    return module;
}());
