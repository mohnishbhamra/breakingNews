
$KW.ComboBox = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("change", "ComboBox", this.eventHandler);
            kony.events.addEvent("click", "ComboBox", this.eventHandler);
        },

        initializeView: function(formId) {
            var editableCombos = document.querySelectorAll("div[name='SelectOptions']");
            if(editableCombos) {
                for(var i = 0; i < editableCombos.length; i++) {
                    var combo = editableCombos[i].parentNode;
                    var comboModel = $KU.getModelByNode(combo);
                    $KG[combo.id + "_autoComplete"] = new module.autocomplete(combo.childNodes[0], {
                        model: comboModel
                    });

                }
            }
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);

            switch(propertyName) {
                case "masterdatamap":
                case "masterdata":
                    var data = $KW.Utils.getMasterData(widgetModel);
                    widgetModel.selectedkey = data.length > 1 ? data[IndexJL][IndexJL] : null;
                    $KW.Utils.setSelectedValueProperty(widgetModel, data, "selectedkey");
                    if(element) {
                        
                        var temp = document.createElement("div");
                        temp.innerHTML = this.generateList(widgetModel, data, {
                            tabpaneID: element.getAttribute("ktabpaneid")
                        });
                        element.parentNode.replaceChild(temp.firstChild, element);
                        if(widgetModel.viewtype == "editableview" && widgetModel.autosuggest) {
                            var combo = $KU.getNodeByModel(widgetModel);
                            $KG[combo.id + "_autoComplete"] = new module.autocomplete(combo.childNodes[0], {
                                model: widgetModel
                            });
                        }
                        element = $KU.getNodeByModel(widgetModel);
                        var isFlexWidget = $KW.FlexUtils.isFlexWidget(widgetModel);
                        if(isFlexWidget) {
                            $KW.FlexUtils.setPaddingByParent(widgetModel, element);
                            $KW.FlexUtils.setDimensions(widgetModel, element.parentNode);
                        }
                        
                        $KU.toggleVisibilty(element, data, widgetModel);
                    }
                    break;

                case "selectedkey":
                    if(element) {
                        var key = widgetModel.selectedkey;
                        if(widgetModel.viewtype == "editableview") {
                            var data = $KW.Utils.getMasterData(widgetModel);
                            var isModified = false;
                            if(data.length > IndexJL) {
                                for(var i = IndexJL; i < data.length; i++) {
                                    if(data[i][IndexJL] == key) {
                                        element.children[0].value = data[i][IndexJL + 1];
                                        isModified = true;
                                        widgetModel["selectedkeyvalue"] = [key, data[i][IndexJL + 1]];
                                        IndexJL && widgetModel["selectedkeyvalue"].splice(0, 0, null);
                                    }
                                }
                            }
                            if(!isModified || data.length < 0) {
                                element.children[0].value = key;
                                widgetModel["selectedkeyvalue"] = [key, key];
                                IndexJL && widgetModel["selectedkeyvalue"].splice(0, 0, null);
                            }
                        } else {
                            element.value = widgetModel.selectedkey;
                            $KW.Utils.setSelectedValueProperty(widgetModel, $KW.Utils.getMasterData(widgetModel), "selectedkey");
                        }
                    }
                    break;

                case "viewtype":
                case "autosuggest":
                    if(element) {
                        var data = $KW.Utils.getMasterData(widgetModel);
                        var temp = document.createElement("div");
                        temp.innerHTML = this.generateList(widgetModel, data, {
                            tabpaneID: element.getAttribute("ktabpaneid")
                        });
                        element.parentNode.replaceChild(temp.firstChild, element);
                        
                        if(propertyName == "autosuggest" && propertyValue && data && data.length > IndexJL) {
                            element = $KU.getNodeByModel(widgetModel);
                            $KG[element.id + "_autoComplete"] = new module.autocomplete(element.childNodes[0], {
                                data: data,
                                model: widgetModel
                            });
                        }
                    }
                    break;

                case "editableareaskin":
                    if(element && widgetModel.viewtype == "editableview") {
                        element.childNodes[0].className = propertyValue;
                    }
                    break;

            }
        },

        render: function(comboboxModel, context) {
            if(typeof $KW.konyPicker !== 'function' || comboboxModel.view === 'popup') {
                comboboxModel.view = 'native';
            }
            if(!comboboxModel.buiskin)
                comboboxModel.buiskin = comboboxModel.blockeduiskin;
            var data = $KW.Utils.getMasterData(comboboxModel);
            data.ispercent = context.ispercent;
            return this.generateList(comboboxModel, data, context);
        },

        generateList: function(comboboxModel, data, context) {
            var htmlString = "";
            var computedSkin = $KW.skins.getWidgetSkinList(comboboxModel, context, data);
            if(!comboboxModel.view || comboboxModel.view == 'native') {
                if(data.length > IndexJL) {
                    var key = comboboxModel.selectedkey;
                    comboboxModel.selectedkey = key ? key : data[IndexJL][IndexJL]; 
                    $KW.Utils.setSelectedValueProperty(comboboxModel, data, "selectedkey");
                }
            }
            if(comboboxModel.viewtype == "editableview") {
                var value = "";
                var options = "";
                var cwt = $KW.skins.getMarPadAdjustedContainerWeightSkin(comboboxModel, 100);
                for(var i = IndexJL; i < data.length; i++) {
                    (comboboxModel.selectedkey == data[i][IndexJL]) && (value = data[i][1 + IndexJL]);
                    if(!comboboxModel.autosuggest) {
                        options += "<div value='" + data[i][IndexJL] + "' name='SelectOption' style='padding: 1px; padding-left:3px;" + (comboboxModel.selectedkey == data[i][1] ? "background-color:#3169C6;color:#FFFFFF" : "") + "'>" + data[i][1 + IndexJL] + "</div>";
                    }
                }
                value = value || comboboxModel.selectedkey || "";
                
                var style = "line-height:16px !important;width:50%;padding-left:2px;font: inherit;border:0px;float:left;" + (!comboboxModel.editableareaskin ? "background:transparent;" : "");
                htmlString = "<div " + $KW.Utils.getBaseHtml(comboboxModel, context) + "style='position: relative;' class='" + computedSkin + "'><input class='" + comboboxModel.editableareaskin + "'" + " style='" + style + "height:16px !important" + "' type='text' value='" + value + "'" + ((comboboxModel.length) ? " maxlength='" + comboboxModel.length + "'" : "") + "/><img name='SelectImage' src='" + $KU.getImageURL("select_arrow.gif") + "' onmouseover='$KW.ComboBox.toggleSelection(arguments[0])' onmouseout='$KW.ComboBox.toggleSelection(arguments[0])' style='position: absolute; right:0px; height: 100%;' onload='$KW.ComboBox.adjustWidth(arguments[0])'/>";
                style = "position: absolute;z-index: 10;display:none;text-align:left;left:-1px;";
                htmlString += "<div id='" + comboboxModel.pf + "_" + comboboxModel.id + "_options' name='SelectOptions' class='" + cwt + " " + (comboboxModel.skin || "") + "' style='overflow:auto;max-height:150px;" + style + "' onmouseover='this.parentNode.firstChild.blur();$KW.ComboBox.toggleSelection(arguments[0])'>" + options + "</div>";
                htmlString += "</div>";
                return htmlString;
            }

            if(!comboboxModel.view || comboboxModel.view == 'native') {
                htmlString = "<select " + $KW.Utils.getBaseHtml(comboboxModel, context) + "class='" + computedSkin + "'" + (comboboxModel.disabled ? " disabled='true'" : "") + " style='" + $KW.skins.getBaseStyle(comboboxModel, context) + "'>";
                for(var i = IndexJL; i < (data.length); i++) {
                    if(data[i][IndexJL] != null && data[i][1 + IndexJL] != null) {
                        var selected = (comboboxModel.selectedkey == data[i][IndexJL]) ? "selected" : "";
                        var ariaString = $KU.getAccessibilityValues(comboboxModel, data[i][2 + IndexJL], data[i][IndexJL]);
                        htmlString += "<option  " + ariaString + " value='" + data[i][IndexJL] + "' " + selected + ">" + $KU.escapeHTMLSpecialEntities(data[i][1 + IndexJL]) + "</option>";
                    }
                }
                htmlString += "</select>";

            } else { 
                var skin = 'kselect ';
                skin += (comboboxModel.skin) ? comboboxModel.skin : 'klistbox';
                htmlString += '<div id="' + comboboxModel.pf + '_' + comboboxModel.id + '"' + (context.tabpaneID ? ' ktabpaneid="' + context.tabpaneID + '"' : '') + ' kformname="' + comboboxModel.pf + '" kwidgettype="' + comboboxModel.wType + '"  class="' + skin + ' ' + computedSkin + ' idevice kddicon" ' + (comboboxModel.disabled ? 'disabled="true" ' : '') + ' style="text-align:left;">';

                if(comboboxModel.masterdata) {
                    if(!comboboxModel.selectedkey) {
                        comboboxModel.selectedkey = comboboxModel.masterdata[0 + IndexJL][0 + IndexJL];
                        $KW.Utils.setSelectedValueProperty(comboboxModel, data, "selectedkey");
                        htmlString += comboboxModel.masterdata[0 + IndexJL][1 + IndexJL];
                    } else {
                        for(var d = IndexJL; d < comboboxModel.masterdata.length; d++) {
                            if(comboboxModel.masterdata[d][0 + IndexJL] === comboboxModel.selectedkey) {
                                htmlString += comboboxModel.masterdata[d][1 + IndexJL];
                                break;
                            }
                        }
                    }
                }

                htmlString += '</div>';
            }

            return htmlString;
        },


        textChangeEventHandler: function(eventObject, target) {
            var comboboxModel = $KU.getModelByNode(target.parentNode);
            if(comboboxModel) {
                comboboxModel.selectedkey = target.value;
                comboboxModel["selectedkeyvalue"] = [target.value, target.value];
                IndexJL && comboboxModel["selectedkeyvalue"].splice(0, 0, null);


            }
        },

        eventHandler: function(eventObject, target, srcElement) {
            var comboboxModel = $KU.getModelByNode(target);
            var data = $KW.Utils.getMasterData(comboboxModel);
            if(comboboxModel) {
                var key;
                if(comboboxModel.viewtype == "editableview") {
                    var optionsDiv = target.children[2];
                    if(srcElement.tagName == 'IMG') {
                        if(optionsDiv.style.display == 'block')
                            optionsDiv.style.display = 'none';
                        else {
                            if(comboboxModel.autosuggest) {
                                var instance = $KG[target.id + "_autoComplete"];
                                instance.renderDropdown(data);
                            }
                            optionsDiv.style.display = 'block';
                            module.setSelectedSkin(comboboxModel, optionsDiv.children);
                        }
                    } else if(srcElement.getAttribute("name") == 'SelectOption') {
                        key = srcElement.getAttribute("value");
                        target.children[0].value = srcElement.innerText || srcElement.textContent;
                        srcElement.style.backgroundColor = "#3169C6";
                        srcElement.style.color = "#FFFFFF";
                        optionsDiv.style.display = 'none';
                        comboboxModel["selectedkeyvalue"] = IndexJL ? [null, key, srcElement.innerText || srcElement.textContent] : [key, srcElement.innerText || srcElement.textContent];
                    } else { 
                        if(eventObject.type == "click")
                            optionsDiv.style.display = 'none';
                        key = srcElement.value;
                        comboboxModel["selectedkeyvalue"] = IndexJL ? [null, key, key] : [key, key];
                    }


                } else {
                    key = target.value;
                }
                if(comboboxModel.viewtype != "editableview" && eventObject.type == "click")
                    return;
                comboboxModel.selectedkey = key;


                spaAPM && spaAPM.sendMsg(comboboxModel, 'onselection');
                $KAR && $KAR.sendRecording(comboboxModel, 'selectItem', {'selection': key, 'target': target, 'eventType': 'uiAction'});
                if(target.getAttribute("kcontainerID"))
                    $KW.Utils.updateContainerData(comboboxModel, target, false);
                else {
                    if(comboboxModel.viewtype != "editableview") {
                        module.resetOption(comboboxModel, target, data);
                        $KW.Utils.setSelectedValueProperty(comboboxModel, $KW.Utils.getMasterData(comboboxModel), "selectedkey");
                    }

                    if((comboboxModel.ondone || comboboxModel.onselection) && comboboxModel.blockeduiskin) {
                        $KW.skins.applyBlockUISkin(comboboxModel);
                    }
                    var comboBoxHandlr = $KU.returnEventReference(comboboxModel.ondone || comboboxModel.onselection);
                    comboBoxHandlr && $KU.executeWidgetEventHandler(comboboxModel, comboBoxHandlr);
                }
            }
        },

        resetOption: function(wModel, target, data) {
            var inputElements = target.childNodes;
            for(var i = 0; i < inputElements.length; i++) {
                inputElements[i].removeAttribute("selected");
            }
            for(var i = 0; i <= inputElements.length; i++) {
                var selectElement = (wModel.selectedkey == data[i][0]) ? "selected" : "";
                if(selectElement == "selected") {
                    target.childNodes[i].setAttribute("selected", "");
                    break;
                }
            }
        },

        toggleSelection: function(event) {
            var event = event || window.event;
            var target = event.currentTarget || event.srcElement;
            if(target.tagName == "IMG") {
                if(event.type == "mouseover")
                    target.src = $KU.getImageURL("select_arrow_hover.gif");
                else
                    target.src = $KU.getImageURL("select_arrow.gif");
            } else {
                var optionsDiv = target;
                var comboboxModel = $KU.getModelByNode(optionsDiv.parentNode);
                var options = optionsDiv.children;
                for(var i = 0; i < options.length; i++) {
                    if(comboboxModel.selectedkeyvalue && options[i].innerHTML == comboboxModel.selectedkeyvalue[1 + IndexJL]) {
                        options[i].style.backgroundColor = "";
                        options[i].style.color = "";
                    }
                }
            }
        },

        adjustWidth: function(event) {
            var event = event || window.event;
            var target = event.currentTarget || event.srcElement;
            var combo = target.parentNode;
            var comboModel = $KU.getModelByNode(combo);
            if(comboModel && comboModel.viewtype == "editableview") {
                var pWidth = combo.clientWidth;
                var imgWidth = combo.children[1].clientWidth;
                if(pWidth && imgWidth)
                    combo.firstChild.style.width = ((pWidth - imgWidth) / pWidth) * 100 + '%';
            }
        },

        setSelectedSkin: function(model, options) {
            for(var i = 0; i < options.length; i++) {
                if(model.selectedkeyvalue && options[i].innerHTML == model.selectedkeyvalue[2]) {
                    options[i].style.backgroundColor = "#3169C6";
                    options[i].style.color = "#FFFFFF";
                } else {
                    options[i].style.backgroundColor = "";
                    options[i].style.color = "";
                }
            }
        }
    };

    module.autocomplete = function(el, options) {
        this.textBox = el;
        this.dropDown = el.parentNode.childNodes[2];
        el.parentNode.style.height = el.offsetHeight + 'px';
        this.dropDown.style.top = (el.parentNode.offsetHeight - 1) + 'px';
        this.dropDown.style.width = el.parentNode.offsetWidth + 'px';
        if(options && options.model.autosuggest) {
            for(var i in options) this[i] = options[i];
            kony.events.addEventListener(el, 'keyup', this.handleEvent.bind(this));
            kony.events.addEventListener(el, 'keydown', this.handleEvent.bind(this));
        }
    };

    module.autocomplete.prototype = {
        handleEvent: function(e) {
            e = e || window.event;
            var that = this;
            switch(e.type) {
                case "keydown":
                    that.onKeyDown(e);
                    break;
                case "keyup":
                    that.onKeyUp(e);
                    break;
            }
        },

        onKeyDown: function(event) {
            if(!event)
                event = window.event;
            var keyCode = event.keyCode;
            switch(keyCode) {
                case 38: 
                    this.moveUp();
                    break;
                case 40: 
                    this.moveDown();
                    break;
            }
        },

        onKeyUp: function(event) {
            if(!event)
                event = window.event;
            var keyCode = event.keyCode;
            if((keyCode >= 33 && keyCode < 46) || (keyCode >= 112 && keyCode <= 123)) {
                
            } else if(keyCode == 13 || keyCode == 27) { 
                this.dropDown.style.display = "none";
            } else {
                this.showOptions();
            }
        },

        showOptions: function() {
            var txt = this.textBox.value;
            this.cur = -1;
            if(txt.length > 0) {
                var matches = this.getMatches(txt);
                if(matches.length > IndexJL) {
                    this.renderDropdown(matches);
                    this.dropDown.style.display = "block";
                } else {
                    this.dropDown.innerHTML = "";
                    this.dropDown.style.display = "none";
                }
            } else {
                
                var matches = $KW.Utils.getMasterData(this.model);
                if(matches.length > IndexJL) {
                    this.renderDropdown(matches);
                    this.dropDown.style.display = "block";
                }
            }
        },

        renderDropdown: function(matches) {
            while(this.dropDown.hasChildNodes())
                this.dropDown.removeChild(this.dropDown.firstChild);
            for(var i = IndexJL; i < matches.length; i++) {
                var oNew = document.createElement('div');
                oNew.innerHTML = "<div value='" + matches[i][IndexJL] + "' name='SelectOption' style='padding: 1px; padding-left:3px;" + (this.model.selectedkey == matches[i][IndexJL] ? "background-color:#3169C6;color:#FFFFFF" : "") + "'>" + matches[i][1 + IndexJL] + "</div>";
                this.dropDown.appendChild(oNew.firstChild);
            }
        },

        getMatches: function(str) {
            var matches = IndexJL ? [null] : [];
            this.model.selectedkey = null;
            
            var data = $KW.Utils.getMasterData(this.model);
            if(data && data.length > IndexJL) {
                for(var i = IndexJL; i < data.length; i++) {
                    if(data[i][1 + IndexJL].toLowerCase().indexOf(str.toLowerCase()) == 0)  {
                        matches.push(IndexJL ? [null, data[i][IndexJL], data[i][1 + IndexJL]] : [data[i][IndexJL], data[i][1 + IndexJL]]);
                        if(str == data[i][1 + IndexJL])
                            this.model.selectedkey = data[i][IndexJL];
                    }
                }
            }
            return matches;
        },

        moveUp: function() {
            this.dropDown.style.display = "block";
            var options = this.dropDown.childNodes;
            if(options.length > 0 && this.cur > 0) {
                --this.cur;
                this.setSelectedValue(options);
            }
        },

        moveDown: function() {
            this.dropDown.style.display = "block";
            var options = this.dropDown.childNodes;
            if(options.length > 0 && this.cur < (options.length - 1)) {
                ++this.cur;
                this.setSelectedValue(options);
            }
        },

        setSelectedValue: function(options) {
            for(var i = 0; i < options.length; i++) {
                if(i == this.cur) {
                    options[i].style.backgroundColor = "#3169C6";
                    options[i].style.color = "#FFFFFF";
                    this.textBox.value = options[i].innerHTML;
                    this.model.selectedkey = options[i].getAttribute("value");
                    this.model.selectedkeyvalue = IndexJL ? [null, this.model.selectedkey, this.textBox.value] : [this.model.selectedkey, this.textBox.value];
                } else {
                    options[i].style.backgroundColor = "";
                    options[i].style.color = "";
                }
            }
        }
    };


    return module;
}());
