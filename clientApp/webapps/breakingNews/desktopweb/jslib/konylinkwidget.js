
$KW.Link = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "Link", this.eventHandler);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            if(!element)
                return;

            switch(propertyName) {
                case "text":

                    element.innerHTML = $KU.escapeHTMLSpecialEntities(propertyValue);
                    break;
            }
        },

        render: function(linkModel, context) {
            if(!linkModel.buiskin) linkModel.buiskin = linkModel.blockeduiskin;
            var computedSkin = $KW.skins.getWidgetSkinList(linkModel, context);
            var htmlString = "<div" + (linkModel.disabled ? " kdisabled='true'" : "") + $KW.Utils.getBaseHtml(linkModel, context) + "class = '" + computedSkin + "' style='display:inline-block;text-align:" + $KW.skins.getContentAlignment(linkModel) + ";" + $KW.skins.getBaseStyle(linkModel, context) + (context.layoutDir && context.ispercent === false ? ";float:" + context.layoutDir : "") + "'>";
            htmlString += $KU.escapeHTMLSpecialEntities(linkModel.text) + "</div>";
            return htmlString;
        },

        eventHandler: function(eventObject, target) {
            var linkModel = $KU.getModelByNode(target),
                containerId = target.getAttribute("kcontainerID");

            $KAR && $KAR.sendRecording(linkModel, 'click', {'target': target, 'eventType': 'uiAction'});

            
            spaAPM && spaAPM.sendMsg(linkModel, 'onclick');
            if(containerId) {
                $KW.Utils.updateContainerData(linkModel, target, true);
            } else if(linkModel.onclick) {
                var linkhandler = $KU.returnEventReference(linkModel.onclick);
                target.setAttribute("selected", "progressindtr");
                target.setAttribute("progressskin", linkModel.skin);
                linkModel.blockeduiskin && $KW.skins.applyBlockUISkin(linkModel);
                $KU.executeWidgetEventHandler(linkModel, linkhandler);
                $KU.onEventHandler(linkModel);
            }
        }
    };


    return module;
}());
