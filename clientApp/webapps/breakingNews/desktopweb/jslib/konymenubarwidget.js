
kony.widgets.Menubar = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "Menubar", this.eventHandler);
        },

        
        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            switch(propertyName) {
                case "skin":
                    $KW.skins.updateDOMSkin(widgetModel, propertyValue, oldPropertyValue);
                    break;

                case "focusskin":
                    $KW.skins.updateFocusSkin(widgetModel);
                    break;

                case "hoverskin":
                    $KW.skins.updateFocusSkin(widgetModel, "hoverskin");
                    break;

                case "text":
                    var element = kony.utils.getNodeByModel(widgetModel);
                    if(element) element.innerHTML = propertyValue;
                    break;
                case "activemenu":
                    this.updateActiveMenuDOM(widgetModel);
                    break;
            }
        },

        initializeView: function(formId) {
            this.addHoverToMenu(formId);
        },

        
        addHoverToMenu: function(formId) {
            var menuBars = document.querySelectorAll("div[kwidgettype='Menubar']");

            var menuBarArray = document.querySelectorAll("div[kwidgettype='Menubar'] ul li[level='one']");
            for(var i = 0; i < menuBars.length; i++) {
                var menuBar = menuBars[i];
                var menuBarModel = kony.utils.getModelByNode(menuBar);
                if(menuBarModel.view == '1') {
                    var lis = document.querySelectorAll("#" + menuBar.id + " ul li[level='one']");
                    for(var j = 0; j < lis.length; j++) {
                        var node = lis[j];
                        if(node.nodeName == "LI") {
                            node.onmouseover = function(event) {
                                
                                var li = this;
                                var labels = document.querySelectorAll("#" + li.parentNode.parentNode.id + " ul li[itemindex='" + li.getAttribute('itemindex') + "'] > div[mtype] div[kwidgettype='Label']");
                                if(labels.length > 0) {
                                    for(var k = 0; k < 1; k++) {
                                        var label = labels[k];
                                        var labelModel = kony.utils.getModelByNode(label);
                                        if(labelModel.hoverskin) {
                                            if(labelModel.skin)
                                                kony.utils.removeClassName(label, labelModel.skin);
                                            kony.utils.addClassName(label, labelModel.hoverskin);
                                        }
                                    }
                                }
                                var hboxes = document.querySelectorAll("#" + li.parentNode.parentNode.id + " ul li[itemindex='" + li.getAttribute('itemindex') + "'] > div[mtype] div[kwidgettype='HBox']");
                                if(hboxes.length > 0) {
                                    for(var m = 0; m < 1; m++) {
                                        var hbox = hboxes[m];
                                        var hboxModel = kony.utils.getModelByNode(hbox);
                                        if(hboxModel.hoverskin) {
                                            if(hboxModel.skin)
                                                kony.utils.removeClassName(hbox, hboxModel.skin);
                                            kony.utils.addClassName(hbox, hboxModel.hoverskin);
                                        }
                                    }
                                }
                            }

                            node.onmouseout = function(event) {
                                
                                var li = this;
                                var labels = document.querySelectorAll("#" + li.parentNode.parentNode.id + " ul li[itemindex='" + li.getAttribute('itemindex') + "']  > div[mtype] div[kwidgettype='Label']");
                                if(labels.length > 0) {
                                    for(var l = 0; l < 1; l++) {
                                        var label = labels[l];
                                        var labelModel = kony.utils.getModelByNode(label);
                                        if(labelModel.hoverskin) {
                                            if(labelModel.skin)
                                                kony.utils.addClassName(label, labelModel.skin);
                                            kony.utils.removeClassName(label, labelModel.hoverskin);
                                        }
                                    }
                                }
                                var hboxes = document.querySelectorAll("#" + li.parentNode.parentNode.id + " ul li[itemindex='" + li.getAttribute('itemindex') + "']  > div[mtype] div[kwidgettype='HBox']");
                                if(hboxes.length > 0) {
                                    for(var n = 0; n < 1; n++) {
                                        var hbox = hboxes[n];
                                        var hboxModel = kony.utils.getModelByNode(hbox);
                                        if(hboxModel.hoverskin) {
                                            if(hboxModel.skin)
                                                kony.utils.addClassName(hbox, hboxModel.skin);
                                            kony.utils.removeClassName(hbox, hboxModel.hoverskin);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        

        render: function(menubarModel, context) {
            var parentModel = kony.model.getWidgetModel(menubarModel.pf, context.tabpaneID);
            context.menuType = menubarModel.view;

            if(!menubarModel.activemenu)
                menubarModel.activemenu = 1;

            var computedSkin = kony.widgets.skins.getMarginSkin(menubarModel) + " " + kony.widgets.skins.getPaddingSkin(menubarModel) + " " + kony.widgets.skins.getMarAdjustedContainerWeightSkin(menubarModel, 100);

            var baseClass;
            switch(menubarModel.view) {
                case "1":
                    baseClass = "kDropDownMenu";
                    break;
                case "2":
                    baseClass = "kDropLineMenu";
                    break;
                case "3":
                    baseClass = "kTreeMenu";
                    break;
                case "4":
                    baseClass = "kContextMenu";
                    break;

            }

            var htmlString = "<div " + kony.widgets.Utils.getBaseHtml(menubarModel, context) + " class = ' " + computedSkin + " ";

            if(menubarModel.skin)
                htmlString += menubarModel.skin + " ";

            htmlString += " '>";

            htmlString += "<ul class='" + baseClass + " ";

            if(menubarModel.skin)
                htmlString += menubarModel.submenuskin + " ";

            htmlString += "' id='" + menubarModel.id + "_Ul'>";
            var item;
            context.formID = menubarModel.pf;
            menubarModel.context = context;

            htmlString += module.renderMenubar(menubarModel, context);

            htmlString += "</ul>";
            htmlString += "</div>";
            return htmlString;
        },

        renderMenubar: function(menubarModel, context) {
            var htmlString = '';
            var item;
            if(menubarModel.menudata) {
                context.container = menubarModel;
                for(var i = 1; i < menubarModel.menudata.length; i++) {
                    item = menubarModel.menudata[i];
                    var template = item.template;
                    var itemData = item.data;

                    if(item.type === "menu")
                        htmlString += module.renderMenu(menubarModel, item, context, i);
                    else
                        htmlString += module.renderMenuitem(menubarModel, item, context, i);
                }
                context.container = "";
            }
            return htmlString;
        },

        renderMenuitem: function(menubarModel, item, context, index) {
            var template = item.template;
            var itemData = item.data;

            var htmlString = "<li ";

            if(index.toString().length === 1)
                htmlString += " level='one' ";
            htmlString += " itemindex='" + index + "' ";
            if(menubarModel.activemenu && menubarModel.activemenu == index)
                htmlString += " activemenu=yes ";
            htmlString += ">";

            if(template && itemData) {
                menubarModel.widgetsData = itemData;
                kony.widgets.Utils.updateLayoutData(window[template], itemData);
                htmlString += kony.widgets.Form.generateTemplate(template, "menuitem", context);
            }

            htmlString += "</li>";
            return htmlString;
        },

        renderMenu: function(menubarModel, item, context, index) {
            var template = item.template;
            var itemData = item.data;
            var subitem;
            var htmlString = "";
            if(item.width)
                htmlString += "<li style='width:" + item.width + "%;' itemindex='" + index + "' ";
            else
                htmlString += "<li itemindex='" + index + "' ";

            if(index.toString().length === 1)
                htmlString += " level='one' ";

            if(menubarModel.activemenu && menubarModel.activemenu == index)
                htmlString += " activemenu=yes ";

            htmlString += " >"
            var subMenuData = item.items;

            if(menubarModel.view === '3' && item.selectionindicator && item.expandedimage && item.collapsibleimage) {
                if(item.isexpand) {
                    itemData[item.selectionindicator] = item.collapsibleimage;
                } else {
                    itemData[item.selectionindicator] = item.expandedimage;
                }
            }
            menubarModel.widgetsData = itemData;
            kony.widgets.Utils.updateLayoutData(window[template], itemData);
            htmlString += kony.widgets.Form.generateTemplate(template, "menu", context);

            if(subMenuData && subMenuData.length > 1) {
                htmlString += "<ul"
                if(menubarModel.view === '3') {
                    if(item.isexpand) {
                        htmlString += " class='show' ";
                    } else {
                        htmlString += " class='hide' ";
                    }
                } else {
                    htmlString += " class='kwt100 ";
                    if(menubarModel.submenuskin)
                        htmlString += menubarModel.submenuskin;
                    htmlString += " ' ";
                }
                htmlString += " style='z-index:1' >";
                for(var i = 1; i < subMenuData.length; i++) {
                    subitem = subMenuData[i];
                    if(subitem.type === "menu")
                        htmlString += module.renderMenu(menubarModel, subitem, context, index + "," + i);
                    else
                        htmlString += module.renderMenuitem(menubarModel, subitem, context, index + "," + i);
                }
                htmlString += "</ul>";
            }

            htmlString += "</li>";
            return htmlString;
        },

        setData: function(menubarModel, dataArray) {
            if(kony.utils.isArray(dataArray)) {
                menubarModel.menudata = dataArray;
                var menu = kony.utils.getNodeByModel(menubarModel);
                if(menu) {
                    menu.childNodes[0].innerHTML = this.renderMenubar(menubarModel, menubarModel.context);
                }
            }
        },

        eventHandler: function(eventObject, target) {
            var menuitem = kony.utils.getParentByAttribute(target, "itemindex");
            var menubar = kony.utils.getParentByAttribute(menuitem, "kwidgettype");
            var menubarModel = kony.utils.getModelByNode(menubar);

            if(menubarModel) {
                var index = menuitem.getAttribute("itemindex");
                var indexArray = index.split(',');

                if(indexArray.length > 0)
                    indexArray.splice(0, 0, null);
                menubarModel.focusedindex = indexArray;

                var menuData = menubarModel.menudata;
                var subMenuData = menuData;

                for(var i = 1; i < indexArray.length; i++) {
                    if(i == 1) {
                        subMenuData = subMenuData[indexArray[i]];
                    } else {
                        subMenuData = subMenuData.items[indexArray[i]];
                    }
                }
                

                

                switch(menubarModel.view) {
                    case "1":
                        
                        module.kDropDownMenuHoverEvent(eventObject, target, menubarModel);
                        break;
                    case "2":
                        
                        break;
                    case "3":
                        module.kTreeMenuEvent(eventObject, target, menubarModel, subMenuData, index);
                        break;
                    case "4":
                        
                        break;

                }

                var menubarhandler = kony.utils.returnEventReference(menubarModel.onclick);

                if(menubarModel.onclick) {
                    
                    menubarhandler(menubarModel, indexArray, subMenuData.data);
                }
                if(menubarModel.activemenu) {
                    if(menubarModel.activemenu != menubarModel.focusedindex[1]) {
                        menubarModel.activemenu = menubarModel.focusedindex[1];
                        this.updateActiveMenuDOM(menubarModel);
                    }
                }
            }
        },

        kTreeMenuEvent: function(eventObject, target, menubarModel, subMenuData, index) {
            var menuitem = kony.utils.getParentByAttribute(target, "mtype");
            if(menuitem.getAttribute("mtype") == "menu") {

                var ulElement = kony.utils.getNextSibling(menuitem);
                var img = document.querySelector("[itemindex='" + index + "'] [id='" + menuitem.id + '_' + subMenuData.selectionindicator + "']");

                if(kony.utils.hasClassName(ulElement, 'hide')) {
                    if(subMenuData.collapsibleimage && img) {
                        img.src = kony.widgets.Image.getImageURL(subMenuData.collapsibleimage);
                    }
                    kony.utils.removeClassName(ulElement, 'hide');
                    kony.utils.addClassName(ulElement, 'show');
                } else {
                    kony.utils.removeClassName(ulElement, 'show');
                    kony.utils.addClassName(ulElement, 'hide');
                    if(subMenuData.expandedimage && img) {
                        img.src = kony.widgets.Image.getImageURL(subMenuData.expandedimage);
                    }
                }

            }
            
        },

        kDropDownMenuHoverEvent: function(eventObject, target, menubarModel) {
            var cur = target;

            while(cur) {
                if(cur.tagName === "UL") {
                    if(kony.utils.hasClassName(cur, 'kDropDownMenu'))
                        break;
                    kony.utils.addClassName(cur, 'hide');
                }
                cur = cur.parentNode;
            }
            setTimeout(
                function() {
                    cur = target;
                    while(cur) {
                        if(cur.tagName === "UL") {
                            if(kony.utils.hasClassName(cur, 'kDropDownMenu'))
                                return;
                            kony.utils.removeClassName(cur, 'hide');
                        }
                        cur = cur.parentNode;
                    }
                }, 1);
        },

        updateActiveMenuDOM: function(menubarModel) {
            var liElements = document.querySelectorAll("#" + menubarModel.pf + '_' + menubarModel.id + " > ul")[0];
            for(var k = 0; k < liElements.children.length; k++) {
                var liElement = liElements.children[k];
                if(liElement.getAttribute("itemindex") == menubarModel.activemenu) {
                    liElement.setAttribute("activemenu", "yes");
                } else {
                    if(liElement.getAttribute("activemenu"))
                        liElement.removeAttribute("activemenu");
                }
            }
        },

        expandAll: function(menubarModel, flag) {
            if(menubarModel.view === '3') {
                var divArray = document.querySelectorAll("#" + menubarModel.pf + "_" + menubarModel.id + " div[mtype=menu]");
                if(divArray && divArray.length > 0) {
                    for(var i = 0; i < divArray.length; i++) {
                        var divElement = divArray[i];
                        var liElement = divArray[i].parentNode;
                        var ulElement = kony.utils.getNextSibling(divArray[i]);

                        var index = liElement.getAttribute("itemindex");
                        var indexArray = index.split(',');
                        var subMenuData = menubarModel.menudata;

                        for(var j = 0; j < indexArray.length; j++) {
                            if(j == 0) {
                                subMenuData = subMenuData[indexArray[j]];
                            } else {
                                subMenuData = subMenuData.items[indexArray[j]];
                            }
                        }

                        var img = document.querySelector("[itemindex='" + index + "'] [id='" + divElement.id + '_' + subMenuData.selectionindicator + "']");

                        if(flag) {
                            if(subMenuData.collapsibleimage && img) {
                                img.src = kony.widgets.Image.getImageURL(subMenuData.collapsibleimage);
                            }
                            if(kony.utils.hasClassName(ulElement, 'hide')) {
                                kony.utils.removeClassName(ulElement, 'hide');
                                kony.utils.addClassName(ulElement, 'show');
                            } else {
                                kony.utils.addClassName(ulElement, 'show');
                            }
                        } else {
                            if(kony.utils.hasClassName(ulElement, 'show')) {
                                kony.utils.removeClassName(ulElement, 'show');
                                kony.utils.addClassName(ulElement, 'hide');
                            } else {
                                kony.utils.addClassName(ulElement, 'hide');
                            }
                            if(subMenuData.expandedimage && img) {
                                img.src = kony.widgets.Image.getImageURL(subMenuData.expandedimage);
                            }
                        }
                    }
                }
            }
        },

        expand: function(menubarModel, indexdata, flag) {
            if(menubarModel.view === '3') {

                var menuData = menubarModel.menudata;
                var subMenuData = menuData;
                var indexArray = indexdata;
                for(var i = 1; i < indexArray.length; i++) {
                    if(i == 1) {
                        subMenuData = subMenuData[indexArray[i]];
                    } else {
                        subMenuData = subMenuData.items[indexArray[i]];
                    }
                }

                if(indexdata)
                    indexdata.splice(0, 1);
                var itemindex = indexdata.toString();

                var liElements = document.querySelectorAll("#" + menubarModel.pf + "_" + menubarModel.id + " li[itemindex='" + itemindex + "']");
                if(liElements && liElements.length > 0) {
                    var liElement = liElements[0];
                    var divElement = liElement.childNodes[0];
                    var ulElement;
                    if(divElement.getAttribute('mtype') === "menu")
                        ulElement = kony.utils.getNextSibling(divElement);

                    if(ulElement) {
                        var img = document.querySelector("[itemindex='" + itemindex + "'] [id='" + divElement.id + '_' + subMenuData.selectionindicator + "']");
                        if(flag) {

                            if(subMenuData.collapsibleimage && img) {
                                img.src = kony.widgets.Image.getImageURL(subMenuData.collapsibleimage);
                            }

                            if(kony.utils.hasClassName(ulElement, 'hide')) {
                                kony.utils.removeClassName(ulElement, 'hide');
                                kony.utils.addClassName(ulElement, 'show');
                            } else {
                                kony.utils.addClassName(ulElement, 'show');
                            }
                        } else {
                            if(kony.utils.hasClassName(ulElement, 'show')) {
                                kony.utils.removeClassName(ulElement, 'show');
                                kony.utils.addClassName(ulElement, 'hide');
                            } else {
                                kony.utils.addClassName(ulElement, 'hide');
                            }

                            if(subMenuData.expandedimage && img) {
                                img.src = kony.widgets.Image.getImageURL(subMenuData.expandedimage);
                            }
                        }
                    }
                }
            }
        }
    };


    return module;
}());
