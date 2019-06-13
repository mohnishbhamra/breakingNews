
$KW.MenuContainer = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "MenuContainer", this.eventHandler);
        },

        updateView: function(model, propertyName, propertyValue, oldPropertyValue) {
            var node = $KU.getNodeByModel(model),
                selectedLI = null,
                indexstr = '';
            switch(propertyName) {
                case "skin":
                    $KW.skins.updateDOMSkin(model, propertyValue, oldPropertyValue);
                    break;

                case "activeskin":
                    if(model.viewtype !== constants.MENU_CONTAINER_VIEW_TYPE_CONTEXTVIEW && $KU.isArray(model.selectedindex)) {
                        indexstr = (model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW) ? model.selectedindex.join(',') : model.selectedindex[0].toString();
                        selectedLI = (node.querySelector) ? node.querySelector('li[menuindex="' + indexstr + '"]') : document.querySelector('#' + node.id + ' li[menuindex="' + indexstr + '"]');
                        $KU.removeClassName(selectedLI.firstChild, oldPropertyValue);
                        $KU.addClassName(selectedLI.firstChild, propertyValue);
                    }
                    break;

                case "hoverskin":
                    $KW.skins.updateFocusSkin(model, "hoverskin");
                    break;

                case "selectedindex":
                case "selectedmenuindex":
                    var item = module.getDetails(model, model.selectedindex, 'item');
                    if(item) {
                        module.updateActiveMenu(model, model.selectedindex, oldPropertyValue);
                        model.selecteditem = item;
                        module.expand(model, model.selectedindex);
                    } else {
                        model.selectedindex = oldPropertyValue;
                    }
                    break;

                case "orientation":
                    if(node && propertyValue !== oldPropertyValue && (model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_DROPDOWNVIEW || model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_DROPLINEVIEW)) {
                        for(var i = 0; i < (node.firstChild.childNodes.length - 1); i++) {
                            (function(li) {
                                li.style.cssFloat = (propertyValue === 'horizontal') ? 'left' : 'none';
                            })(node.firstChild.childNodes[i]);
                        }
                    }
                    break;

                case "expandedimage":
                case "collapsedimage":
                    if(node && propertyValue !== oldPropertyValue) {
                        var images = (node.querySelectorAll) ? node.querySelectorAll('image[src="' + $KU.getImageURL(oldPropertyValue) + '"]') : document.querySelectorAll('#' + node.id + ' image[src="' + $KU.getImageURL(oldPropertyValue) + '"]');
                        var newpath = $KU.getImageURL(propertyValue);
                        for(var i = 0; i < images.length; i++) {
                            (function(image) {
                                image.src = 'newpath';
                            })(images[i]);
                        }
                    }
                    break;

                case "data":
                    if(node) {
                        node.firstChild.innerHTML = module.renderAll(model, model.context);
                    }
                    break;
            }
        },

        
        render: function(model, context) {
            context.menuType = model.viewtype;
            context.formID = model.pf;
            model.context = context;

            if(model.viewtype !== constants.MENU_CONTAINER_VIEW_TYPE_CONTEXTVIEW) {
                if(!model.selectedindex || model.selectedindex.length === 0) {
                    model.activemenu = '' + 0;
                    model.selectedindex = [0];
                    model.selecteditem = model.data[0];
                } else {
                    model.activemenu = (model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW) ? model.selectedindex.join(",") : model.selectedindex[0].toString();
                    model.selecteditem = module.getDetails(model, model.selectedindex, 'item');
                }
            }

            var html = '',
                computedSkin = $KW.skins.getWidgetSkinList(model, context),
                style = '';

            html += '<div ' + $KW.Utils.getBaseHtml(model, context) + ' class = "' + computedSkin + '"';
            style += $KW.skins.getMarginSkin(model, context) + ' ' + $KW.skins.getPaddingSkin(model);
            if(model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_CONTEXTVIEW) {
                if(!model.containerweight) {
                    model.containerweight = 15;
                }
                style += ' visibility:hidden; width:' + model.containerweight + '%;';
            }
            html += ' style="' + style + '">';
            html += '<ul class="KMenu">';
            html += module.renderAll(model, context);
            html += '</ul></div>';

            return html;
        },

        renderAll: function(model, context) {
            var html = '',
                template = null;
            context.container = model;

            for(var i = 0; i < model.data.length; i++) {
                (function(item, index) {
                    template = (item.template) ? item.template : model.menutemplate;

                    if($KU.isArray(item.children) && item.children.length > 0) {
                        html += module.renderMenu(model, item, context, index);
                    } else {
                        html += module.renderItem(model, item, context, index);
                    }
                })(model.data[i], i);
            }
            html += '<li class="KClear">';

            context.container = '';

            return html;
        },

        renderMenu: function(model, item, context, index) {
            if(typeof index === 'string' || typeof index === 'number') {
                index = index.toString().split(',');
            }
            if(!$KU.isArray(index)) {
                return;
            }

            var html = '',
                ulstyle = '',
                listyle = '',
                subItem = null,
                children = item.children
            indexStr = index.join(',')
            tempDiv = document.createElement('div')
            width = (item.metaInfo && item.metaInfo.width) ? item.metaInfo.width : (model.width) ? model.width : 20
            subMenuWidth = (item.metaInfo && item.metaInfo.subMenuWidth) ? item.metaInfo.subMenuWidth : (model.subMenuWidth) ? model.subMenuWidth : 200
            template = (item.template) ? item.template : model.menutemplate
            expandedimage = (item.expandedimage) ? item.expandedimage : (model.expandedimage) ? model.expandedimage : ''
            collapsedimage = (item.collapsedimage) ? item.collapsedimage : (model.collapsedimage) ? model.collapsedimage : ''
            indicatorimage = (item.indicatorimage) ? item.indicatorimage : (model.indicatorimage) ? model.indicatorimage : '';

            if(model.selectedindex && model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW) {
                var selectedIndexStr = model.selectedindex.join(',');
            }
            var menuindex = index.join(',');
            html += '<li menuindex="' + menuindex + '"';
            if(model.viewtype !== constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW) {
                html += ' onmouseover="$KW.MenuContainer.hover(this, \'' + model.pf + '_' + model.id + '\', \'' + model.viewtype + '\', \'' + model.orientation + '\');"';
                html += ' onmouseout="$KW.MenuContainer.hout(this, \'' + model.pf + '_' + model.id + '\', \'' + model.viewtype + '\', \'' + model.orientation + '\');"';
                listyle += 'position:relative; top:0%; left:0%;';
            }
            if(index.length === 1) {
                if(model.orientation === 'horizontal' &&
                    (model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_DROPDOWNVIEW ||
                        model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_DROPLINEVIEW)) {
                    listyle += ' float:left; width:' + width + '%;';
                }
            } else {
                if(model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_DROPLINEVIEW) {
                    listyle += ' float:left;';
                }
            }
            html += ' style="' + listyle + '">';

            model.widgetsData = item;
            tempDiv.setAttribute('kformname', model.pf);
            tempDiv.setAttribute('id', model.pf + '_' + model.id);
            context.tabPaneID && tempDiv.setAttribute('ktabpaneid', context.tabPaneID);
            tempDiv.setAttribute('menuindex', menuindex);

            tempDiv.innerHTML = $KW.Utils.handleLayout(model, template, item);

            if(!expandedimage && !collapsedimage && !indicatorimage) {
                if(model.activemenu && model.activemenu === indexStr) {
                    if(template.skin) {
                        $KU.removeClassName(tempDiv.firstChild, template.skin);
                    }
                    $KU.addClassName(tempDiv.firstChild, model.activeclass);
                }
                html += tempDiv.innerHTML;
            } else {
                html += '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tbody><tr>';

                if(model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW &&
                    model.orientation !== 'horizontal' && expandedimage && collapsedimage) {
                    html += '<td align="left" valign="middle"><img border="0" src="';
                    if(indexStr.length < selectedIndexStr.length && selectedIndexStr.indexOf(indexStr) === 0) {
                        html += $KU.getImageURL(expandedimage);
                    } else {
                        html += $KU.getImageURL(collapsedimage);
                    }
                    html += '"/></td>';
                }

                if(model.activemenu && model.activemenu === indexStr) {
                    if(template.skin) {
                        $KU.removeClassName(tempDiv.firstChild, template.skin);
                    }
                    $KU.addClassName(tempDiv.firstChild, model.activeclass);
                }

                html += '<td align="left" valign="middle" width="100%">' + tempDiv.innerHTML + '</td>';

                if(model.viewtype !== constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW && indicatorimage) {
                    html += '<td align="right" valign="middle"><img border="0"';
                    html += ' src="' + $KU.getImageURL(indicatorimage) + '"/></td>';
                }

                html += '</tr></tbody></table>';
            }
            html += '<ul';
            if(model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW) {
                if(indexStr.length < selectedIndexStr.length && selectedIndexStr.indexOf(indexStr) === 0) {
                    html += ' class="show"';
                } else {
                    html += ' class="hide"';
                }
                ulstyle += 'padding-left:20px;';
            } else {
                html += ' class="hidden"';
                ulstyle += 'position:absolute; top:0%; left:0%; z-index:1; ';
                if(model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_DROPLINEVIEW) {
                    ulstyle += 'width:99999px;';
                } else {
                    if(subMenuWidth) {
                        ulstyle += 'width:' + subMenuWidth + 'px;';
                    }
                }
            }
            html += ' style="' + ulstyle + '">';

            for(var i = 0; i < children.length; i++) {
                (function(item, count) {
                    if($KU.isArray(item.children) && item.children.length > 0) {
                        html += module.renderMenu(model, item, context, index.join(',') + "," + count);
                    } else {
                        html += module.renderItem(model, item, context, index.join(',') + "," + count);
                    }
                })(children[i], i);
            }

            html += '<li class="KClear"></ul></li>';

            return html;
        },

        renderItem: function(model, item, context, index) {
            if(typeof index === 'string' || typeof index === 'number') {
                index = index.toString().split(',');
            }
            if(!$KU.isArray(index)) {
                return;
            }

            var html = '',
                ulstyle = '',
                listyle = '',
                tempDiv = document.createElement('div')
            template = (item.template) ? item.template : model.menutemplate
            width = (item.metaInfo && item.metaInfo.width) ? item.metaInfo.width : (model.width) ? model.width : 20
            subMenuWidth = (item.metaInfo && item.metaInfo.subMenuWidth) ? item.metaInfo.subMenuWidth : (model.subMenuWidth) ? model.subMenuWidth : 200
            expandedimage = (item.expandedimage) ? item.expandedimage : (model.expandedimage) ? model.expandedimage : ''
            collapsedimage = (item.collapsedimage) ? item.collapsedimage : (model.collapsedimage) ? model.collapsedimage : ''
            indicatorimage = (item.indicatorimage) ? item.indicatorimage : (model.indicatorimage) ? model.indicatorimage : '';

            html += '<li menuindex="' + index.join(',') + '"';
            if(model.viewtype !== constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW) {
                html += ' onmouseover="$KW.MenuContainer.hover(this, \'' + model.pf + '_' + model.id + '\', \'' + model.viewtype + '\', \'' + model.orientation + '\');"';
                html += ' onmouseout="$KW.MenuContainer.hout(this, \'' + model.pf + '_' + model.id + '\', \'' + model.viewtype + '\', \'' + model.orientation + '\');"';
                listyle += 'position:relative; top:0%; left:0%;';
            }
            if(index.length === 1) {
                if(model.orientation === 'horizontal' &&
                    (model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_DROPDOWNVIEW ||
                        model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_DROPLINEVIEW)) {
                    listyle += ' float:left; width:' + width + '%;';
                }
            } else {
                if(model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_DROPLINEVIEW) {
                    listyle += ' float:left;';
                }
            }
            html += ' style="' + listyle + '">';

            model.widgetsData = item;
            tempDiv.innerHTML = $KW.Utils.handleLayout(model, template, item);

            if(!expandedimage && !collapsedimage && !indicatorimage) {
                if(model.activemenu && model.activemenu === index.toString()) {
                    if(template.skin) {
                        $KU.removeClassName(tempDiv.firstChild, template.skin);
                    }
                    $KU.addClassName(tempDiv.firstChild, model.activeclass);
                }
                html += tempDiv.innerHTML;
            } else {
                html += '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tbody><tr>';

                if(model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW &&
                    model.orientation !== 'horizontal' && expandedimage && collapsedimage) {
                    html += '<td align="left" valign="middle" width="0%"><img border="0" src="';
                    html += $KU.getImageURL(collapsedimage);
                    html += '"/></td>';
                }

                if(model.activemenu && model.activemenu === index.toString()) {
                    if(template.skin) {
                        $KU.removeClassName(tempDiv.firstChild, template.skin);
                    }
                    $KU.addClassName(tempDiv.firstChild, model.activeclass);
                }

                html += '<td align="left" valign="middle" width="100%">' + tempDiv.innerHTML + '</td>';

                if(model.viewtype !== constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW && indicatorimage) {
                    html += '<td align="right" valign="middle" width="0%"><img border="0"';
                    html += ' src="' + $KU.getImageURL(indicatorimage) + '"/></td>';
                }

                html += '</tr></tbody></table>';
            }

            html += '<ul';
            if(model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW) {
                html += ' class="hide"';
                ulstyle += 'padding-left:20px;';
            } else {
                html += ' class="hidden"';
                ulstyle += 'position:absolute; top:0%; left:0%; z-index:1; ';
                if(model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_DROPLINEVIEW) {
                    ulstyle += 'width:99999px;';
                } else {
                    if(subMenuWidth) {
                        ulstyle += 'width:' + subMenuWidth + 'px;';
                    }
                }
            }
            html += ' style="' + ulstyle + '"><li class="KClear"></ul></li>';

            return html;
        },

        eventHandler: function(eventObject, target) {
            var li = null,
                node = null,
                model = null;

            if(target.getAttribute(kony.constants.KONY_WIDGET_TYPE) === 'MenuContainer') { 
                li = $KU.getParentByAttribute(eventObject.target || eventObject.srcElement, "menuindex");
            } else {
                li = $KU.getParentByAttribute(target, "menuindex");
            }

            if(li) {
                node = $KU.getParentByAttribute(li, kony.constants.KONY_WIDGET_TYPE);
            }
            if(node) {
                model = $KU.getModelByNode(node);
                if(!model) { 
                    model = node.id.split('_'); 
                    model.splice(0, 1);
                    model = window[model.join('_')]; 
                }
                if(document.getElementById(model.pf + '_' + model.id).getAttribute('kdisabled') == "true")
                    return;
            }
            if(!model) {
                return;
            }

            var index = li.getAttribute("menuindex");
            if(model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_CONTEXTVIEW && !model.selectedindex) {
                model.selectedindex = index.split(",");
            }
            var oldSelectedIndex = model.selectedindex.slice();
            index = index.split(",");
            model.selectedindex = [];

            for(var i = 0; i < index.length; i++) {
                model.selectedindex.push(parseInt(index[i], 10));
            }

            model.selecteditem = module.getDetails(model, model.selectedindex, 'item');

            module.updateActiveMenu(model, model.selectedindex, oldSelectedIndex);

            if(model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW) {
                var item = module.getDetails(model, model.selectedindex)
                expandedimage = (item.expandedimage) ? item.expandedimage : (model.expandedimage) ? model.expandedimage : ''
                collapsedimage = (item.collapsedimage) ? item.collapsedimage : (model.collapsedimage) ? model.collapsedimage : '';

                if(item.item.children && item.item.children.length > 0) {
                    if($KU.hasClassName(li.lastChild, 'hide')) {
                        $KU.removeClassName(li.lastChild, 'hide');
                        $KU.addClassName(li.lastChild, 'show');

                        if(li.firstChild.tagName === 'TABLE' && expandedimage) {
                            var tr = li.firstChild.firstChild.firstChild;
                            if(tr.childNodes.length === 2) {
                                tr.firstChild.firstChild.src = $KU.getImageURL(expandedimage);
                            }
                        }
                    } else {
                        $KU.removeClassName(li.lastChild, 'show');
                        $KU.addClassName(li.lastChild, 'hide');

                        if(li.firstChild.tagName === 'TABLE' && collapsedimage) {
                            var tr = li.firstChild.firstChild.firstChild;
                            if(tr.childNodes.length === 2) {
                                tr.firstChild.firstChild.src = $KU.getImageURL(collapsedimage);
                            }
                        }
                    }
                }
            } else {
                if(model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_CONTEXTVIEW) {
                    node.style.visibility = 'hidden';
                } else {
                    model.activemenu = model.selectedindex[0].toString();
                }
                var uls = (node.firstChild.querySelectorAll) ? node.firstChild.querySelectorAll('ul') : document.querySelectorAll('#' + node.id + ' ul');
                for(var i = 0; i < uls.length; i++) {
                    (function(ul) {
                        if(!$KU.hasClassName(ul, 'hidden')) {
                            $KU.addClassName(ul, 'hidden');
                        }
                    })(uls[i]);
                }
            }

            
            var boxEventExecuted = kony.events.executeBoxEvent(eventObject, model.selecteditem, model);

            var eventHandler = (!boxEventExecuted) ? $KU.returnEventReference(model.onclick) : null;

            if(model.onclick && eventHandler) {
                eventHandler(model, model.selectedindex, model.selecteditem);
            }

            if(model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_CONTEXTVIEW) {
                model.activemenu = '';
                model.selectedindex = null;
            }
        },

        setData: function(model, data) {
            if($KU.isArray(data)) {
                model.canUpdateUI = false;
                model.data = data;
                $KW.MenuContainer["updateView"](model, "data", data);
                model.canUpdateUI = true;
            }
        },

        setDataAt: function(model, data, index) {
            var itemDetails = module.getDetails(model, index);

            for(var k in itemDetails.item) {
                if(itemDetails.item.hasOwnProperty(k)) {
                    itemDetails.item[k] = data[k];
                }
            }

            if(!itemDetails.node) {
                return;
            }

            var tempNode = document.createElement('div');
            tempNode.innerHTML = ($KU.isArray(data.children) && data.children.length > 0) ? module.renderMenu(model, data, model.context, index) : module.renderItem(model, data, model.context, index);
            itemDetails.node.parentNode.replaceChild(tempNode.firstChild, itemDetails.node);
        },

        addAll: function(model, data) {
            if($KU.isArray(data)) {
                var node = $KU.getNodeByModel(model)
                tempDiv = document.createElement('div');
                node = node.firstChild;
                for(var i = 0; i < data.length; i++) {
                    (function(item, index) {
                        model.data.push(item); 

                        
                        tempDiv.innerHTML = ($KU.isArray(item.children) && item.children.length > 0) ? module.renderMenu(model, item, model.context, (model.data.length - 1)) : module.renderItem(model, item, model.context, (model.data.length - 1));
                        node.insertBefore(tempDiv.firstChild, node.lastChild);
                    })(data[i], i);
                }
            }
        },

        addDataAt: function(model, data, index) {
            var itemDetails = module.getDetails(model, index, 'add');

            
            if(typeof data === 'object' && $KU.isArray(itemDetails.parent)) {
                if(itemDetails.position === 'append') {
                    itemDetails.parent.push(data);
                } else if(itemDetails.position === 'after') {
                    itemDetails.parent[itemDetails.index].push(data);
                } else if(itemDetails.position === 'before') {
                    itemDetails.parent.splice(itemDetails.index, 0, data);
                }
                if(itemDetails.node) {
                    var tempNode = document.createElement('div');
                    tempNode.innerHTML = ($KU.isArray(data.children)) ? module.renderMenu(model, data, model.context, index) : module.renderItem(model, data, model.context, index);

                    
                    if(itemDetails.position === 'append') {
                        itemDetails.node.insertBefore(tempNode.firstChild, itemDetails.node.lastChild);
                    } else if(itemDetails.position === 'after') {
                        itemDetails.node.parentNode.insertBefore(tempNode.firstChild, itemDetails.node.nextSibling);
                    } else if(itemDetails.position === 'before') {
                        itemDetails.node.parentNode.insertBefore(tempNode.firstChild, itemDetails.node);
                    }

                    module.adjustIndexes(model);
                }
            }
        },

        removeAll: function(model) {
            module.setData(model, []);
        },

        removeAt: function(model, index) {
            var itemDetails = module.getDetails(model, index);
            if($KU.isArray(itemDetails.parent)) {
                itemDetails.parent.splice(itemDetails.index, 1); 
                itemDetails.node.parentNode.removeChild(itemDetails.node); 

                module.adjustIndexes(model);
            }
        },

        hover: function(li, menuid, viewtype, orientation) {
            var targetNodeHover = document.getElementById(menuid);
            var targetNodeHoverIsDisabled = targetNodeHover.getAttribute('kdisabled');
            if(targetNodeHoverIsDisabled != null && targetNodeHoverIsDisabled == "true") {
                return;
            } else {
                viewtype = parseInt(viewtype, 10);
                if(viewtype === constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW) {
                    return;
                }
                if(li.lastChild.childNodes.length > 1) {
                    var index = li.getAttribute('menuindex');

                    if((viewtype === constants.MENU_CONTAINER_VIEW_TYPE_DROPDOWNVIEW &&
                            orientation === 'horizontal' && index.length === 1) ||
                        (viewtype === constants.MENU_CONTAINER_VIEW_TYPE_DROPLINEVIEW)) {
                        li.lastChild.style.top = '100%';
                        li.lastChild.style.left = '0%';
                    } else {
                        li.lastChild.style.top = '0%';
                        li.lastChild.style.left = '100%';
                    }

                    if(viewtype === constants.MENU_CONTAINER_VIEW_TYPE_DROPLINEVIEW) {
                        var node = document.getElementById(menuid),
                            model = $KU.getModelByNode(node);
                        for(var e = 0; e < (li.lastChild.childNodes.length - 1); e++) {
                            (function(i, el) {
                                var item = module.getDetails(model, index + ',' + i, 'item')
                                width = (item.metaInfo && item.metaInfo.width) ? item.metaInfo.width : (model.width) ? model.width : 20
                                subMenuWidth = (item.metaInfo && item.metaInfo.subMenuWidth) ? item.metaInfo.subMenuWidth : (model.subMenuWidth) ? model.subMenuWidth : 200;

                                el.style.width = Math.ceil((node.offsetWidth * width) / 100) + 'px';
                            })(e, li.lastChild.childNodes[e]);
                        }
                    }
                    $KU.removeClassName(li.lastChild, 'hidden');
                    var submenus = li.lastChild.children;
                    if(submenus) {
                        for(var i = 0; i < submenus.length - 1; i++) {
                            if(submenus[i]) {
                                var imgs = submenus[i].children[0].getElementsByTagName("img");
                                if(imgs) {
                                    for(var j = 0; j < imgs.length; j++) {
                                        imgs[j].style.visibility = 'visible';
                                    }
                                }
                            }
                        }
                    }
                }
            }

        },

        hout: function(li, menuid, viewtype, orientation) {
            if(viewtype === constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW.toString()) {
                return;
            }

            if(li.lastChild.childNodes.length > 1) {
                $KU.addClassName(li.lastChild, 'hidden');

                var submenus = li.lastChild.children;
                if(submenus) {
                    for(var i = 0; i < submenus.length - 1; i++) {
                        if(submenus[i]) {
                            var imgs = submenus[i].children[0].getElementsByTagName("img");
                            if(imgs) {
                                for(var j = 0; j < imgs.length; j++) {
                                    imgs[j].style.visibility = 'hidden';
                                }
                            }
                        }
                    }
                }
            }
        },

        expand: function(model, index, recursive) {
            if(model.viewtype !== constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW) {
                return;
            }

            if(typeof index === 'string' || typeof index === 'number') {
                index = index.toString().split(',');
            }
            if(!$KU.isArray(index)) {
                return;
            }

            var ul = $KU.getNodeByModel(model).firstChild,
                li = null,
                tr = null,
                item = module.getDetails(model, index),
                expandedimage = (item.expandedimage) ? item.expandedimage : (model.expandedimage) ? model.expandedimage : '',
                collapsedimage = (item.collapsedimage) ? item.collapsedimage : (model.collapsedimage) ? model.collapsedimage : '';

            for(var i = 0; i < index.length; i++) {
                (function(count) {
                    ul = ul.childNodes[count].lastChild;
                    if(ul.childNodes.length > 1) {
                        $KU.removeClassName(ul, 'hide');
                        $KU.addClassName(ul, 'show');
                        li = ul.parentNode;
                        if(li.firstChild.tagName === 'TABLE' && expandedimage) {
                            tr = li.firstChild.firstChild.firstChild;
                            if(tr.childNodes.length === 2) {
                                tr.firstChild.firstChild.src = $KU.getImageURL(expandedimage);
                            }
                        }
                    }
                })(index[i]);
            }

            if(recursive === true) {
                var uls = ul.querySelectorAll('ul.hide');

                for(var i = 0; i < uls.length; i++) {
                    (function(ul) {
                        if(ul.childNodes.length > 1) {
                            $KU.removeClassName(ul, 'hide');
                            $KU.addClassName(ul, 'show');
                            li = ul.parentNode;
                            if(li.firstChild.tagName === 'TABLE' && expandedimage) {
                                tr = li.firstChild.firstChild.firstChild;
                                if(tr.childNodes.length === 2) {
                                    tr.firstChild.firstChild.src = $KU.getImageURL(expandedimage);
                                }
                            }
                        }
                    })(uls[i]);
                }
            }
        },

        collapse: function(model, index, recursive) {
            if(model.viewtype !== constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW) {
                return;
            }

            if(typeof index === 'string' || typeof index === 'number') {
                index = index.toString().split(',');
            }
            if(!$KU.isArray(index)) {
                return;
            }

            var ul = $KU.getNodeByModel(model).firstChild,
                li = null,
                tr = null,
                item = module.getDetails(model, index),
                expandedimage = (item.expandedimage) ? item.expandedimage : (model.expandedimage) ? model.expandedimage : '',
                collapsedimage = (item.collapsedimage) ? item.collapsedimage : (model.collapsedimage) ? model.collapsedimage : '';

            for(var i = 0; i < index.length; i++) {
                (function(count) {
                    ul = ul.childNodes[count].lastChild;
                    if(ul.childNodes.length > 1) {
                        $KU.removeClassName(ul, 'show');
                        $KU.addClassName(ul, 'hide');
                        li = ul.parentNode;
                        if(li.firstChild.tagName === 'TABLE' && collapsedimage) {
                            tr = li.firstChild.firstChild.firstChild;
                            if(tr.childNodes.length === 2) {
                                tr.firstChild.firstChild.src = $KU.getImageURL(collapsedimage);
                            }
                        }
                    }
                })(index[i]);
            }

            if(recursive === true) {
                var uls = ul.querySelectorAll('ul.show');

                for(var i = 0; i < uls.length; i++) {
                    (function(ul) {
                        if(ul.childNodes.length > 1) {
                            $KU.removeClassName(ul, 'show');
                            $KU.addClassName(ul, 'hide');
                        }
                        li = ul.parentNode;
                        if(li.firstChild.tagName === 'TABLE' && collapsedimage) {
                            tr = li.firstChild.firstChild.firstChild;
                            if(tr.childNodes.length === 2) {
                                tr.firstChild.firstChild.src = $KU.getImageURL(collapsedimage);
                            }
                        }
                    })(uls[i]);
                }
            }
        },

        expandAll: function(model) {
            if(model.viewtype !== constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW) {
                return;
            }

            var node = $KU.getNodeByModel(model);
            var uls = (node.firstChild.querySelectorAll) ? node.firstChild.querySelectorAll('ul.hide') : document.firstChild.querySelectorAll('#' + node.id + ' ul.hide');

            for(var i = 0; i < uls.length; i++) {
                (function(ul) {
                    if(ul.childNodes.length > 1) {
                        $KU.removeClassName(ul, 'hide');
                        $KU.addClassName(ul, 'show');
                    }
                })(uls[i]);
            }
        },

        collapseAll: function(model, recursive) {
            if(model.viewtype !== constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW) {
                return;
            }

            var node = $KU.getNodeByModel(model);
            var uls = (node.firstChild.querySelectorAll) ? node.firstChild.querySelectorAll('ul.show') : document.firstChild.querySelectorAll('#' + node.id + ' ul.show');

            for(var i = 0; i < uls.length; i++) {
                (function(ul) {
                    if(ul.childNodes.length > 1) {
                        $KU.removeClassName(ul, 'show');
                        $KU.addClassName(ul, 'hide');
                    }
                })(uls[i]);
            }
        },

        
        getDetails: function(model, index, what) {
            if(typeof index === 'string' || typeof index === 'number') {
                index = index.toString().split(',');
            }
            if(!$KU.isArray(index)) {
                return;
            }

            var parent = model.data 
            item = null 
            queryindex = '' 
            position = 'before' 
            loop = [] 
            node = $KU.getNodeByModel(model)
            template = null;

            for(var i = 0; i < index.length; i++) {
                index[i] = parseInt(index[i], 10);
                if(what === 'add' && index[i] < 0) {
                    index[i] = 0;
                }
                item = parent[index[i]];
                if(item) {
                    loop.push(index[i]);
                    template = (item.template) ? item.template : model.menutemplate;
                    if(i < (index.length - 1)) {
                        parent = item.children;
                    }
                } else {
                    break;
                }
            }

            if(!item) {
                if(what === 'add') {
                    position = (loop.length === index.length) ? 'after' : 'append';
                } else {
                    return null;
                }
            }

            if(!what || what === 'add') {
                if(node) {
                    node = (node.querySelectorAll) ? node.querySelectorAll('li[menuindex="' + loop.join(",") + '"]')[0] : document.querySelectorAll('#' + node.id + ' li[menuindex="' + loop.join(",") + '"]')[0];
                }
                if(position === 'append') {
                    if(!node && !loop.length && index.length === 1 && index[0] >= model.data.length) {
                        node = $KU.getNodeByModel(model).firstChild;
                    } else {
                        node = node.lastChild;
                    }
                }
            }

            if(what === 'add') {
                return {
                    parent: parent,
                    item: item,
                    template: template,
                    index: loop[loop.length - 1],
                    loop: loop,
                    position: position,
                    node: node
                };
            } else if(what === 'item') {
                return item;
            } else if(what === 'template') {
                return template;
            } else {
                return {
                    parent: parent,
                    item: item,
                    node: node,
                    index: loop[loop.length - 1]
                };
            }
        },

        updateActiveMenu: function(model, newSelectedIndex, oldSelectedIndex) {
            if(model.viewtype === constants.MENU_CONTAINER_VIEW_TYPE_CONTEXTVIEW) {
                return;
            }
            if(model.viewtype !== constants.MENU_CONTAINER_VIEW_TYPE_TREEVIEW) {
                oldSelectedIndex = [oldSelectedIndex[0]];
                newSelectedIndex = [newSelectedIndex[0]];
            }

            var node = $KU.getNodeByModel(model)
            oldActiveNode = (node.querySelectorAll) ? node.querySelectorAll('li[menuindex="' + oldSelectedIndex.join(',') + '"]')[0] : document.querySelectorAll('#' + node.id + ' li[menuindex="' + oldSelectedIndex.join(',') + '"]')[0]
            newActiveNode = (node.querySelectorAll) ? node.querySelectorAll('li[menuindex="' + newSelectedIndex.join(',') + '"]')[0] : document.querySelectorAll('#' + node.id + ' li[menuindex="' + newSelectedIndex.join(',') + '"]')[0]
            oldTemplate = module.getDetails(model, oldSelectedIndex, 'template')
            newTemplate = module.getDetails(model, newSelectedIndex, 'template');

            if(oldActiveNode) {
                $KU.removeClassName(oldActiveNode.firstChild, model.activeskin);
            }
            if(oldTemplate && oldTemplate.skin) {
                $KU.addClassName(oldActiveNode.firstChild, oldTemplate.skin);
            }
            if(newTemplate && newTemplate.skin) {
                $KU.removeClassName(newActiveNode.firstChild, newTemplate.skin);
            }
            if(newActiveNode) {
                $KU.addClassName(newActiveNode.firstChild, model.activeskin);
            }
        },

        adjustIndexes: function(model, ul, index) {
            ul = (!ul) ? $KU.getNodeByModel(model).firstChild : ul;

            if(typeof index === 'undefined') {
                index = '';
            } else if($KU.isArray(index)) {
                index = index.join(',');
            }

            if(typeof index === 'string' || typeof index === 'number') {
                index = index.toString();
            }

            for(var i = 0; i < (ul.childNodes.length - 1); i++) {
                var newindex = (index) ? index + ',' + i : '' + i;
                ul.childNodes[i].setAttribute("menuindex", newindex);
                module.adjustIndexes(model, ul.childNodes[i].lastChild, newindex);
            }
        }
    };


    return module;
}());
