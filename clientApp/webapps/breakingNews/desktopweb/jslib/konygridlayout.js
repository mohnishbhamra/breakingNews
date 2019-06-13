
kony.widgets.Grid = (function() {
    
    

    var module = {
        
        render: function(widgetModel, context) {
            var htmlString = "";
            if(widgetModel.children) {
                var style = $KW.skins.getMarginSkin(widgetModel, context) + $KW.skins.getPaddingSkin(widgetModel);
                htmlString = "<table cellspacing='0' cellpadding='0' style='xborder:0;xtable-layout:fixed;" + style + "'" + (widgetModel.wType == 'Form' ? '' : $KW.Utils.getBaseHtml(widgetModel, context)) + " class='" + $KW.skins.getWidgetSkinList(widgetModel, context) + "' >";
                var metaInfo = widgetModel.layoutmeta;
                var map = this.getRowColumnMap(widgetModel, context);
                var childModel, attr;

                for(var i = 0; i < metaInfo.rows; i++) {
                    htmlString += "<tr>";

                    for(var j = 0; j < metaInfo.cols; j++) {
                        childModel = map[i][j];
                        if(childModel) {
                            var wType = childModel.wType;
                            if(wType) {
                                attr = " class='" + kony.widgets.skins.getWidgetAlignmentSkin(childModel) + "' rowspan=" + childModel.gridCell.rowSpan + " colspan=" + childModel.gridCell.colSpan;
                            }
                            htmlString += "<td style=' font-size:0px; width:" + metaInfo.colmeta[j].width + "%'" + (wType ? attr : "") + ">";
                            if(wType) {
                                if(wType == 'HBox' || wType == 'VBox' || wType == 'ScrollBox')
                                    context.setTopLevelBox(true);
                                htmlString += kony.widgets[wType].render(childModel, context);
                                if(wType == 'HBox' || wType == 'VBox' || wType == 'ScrollBox')
                                    context.setTopLevelBox(false);
                            }
                            htmlString += "</td>";
                        }

                    }
                    htmlString += "</tr>";
                }
                htmlString += "</table>";
            }

            return htmlString;
        },

        getRowColumnMap: function(widgetModel, context) {
            var children = widgetModel.children;
            var temp = [];
            var childModel;
            var metaInfo = widgetModel.layoutmeta;

            for(var i = 0; i < metaInfo.rows; i++) {
                temp.push([]);
                for(var j = 0; j < metaInfo.cols; j++) {
                    temp[i][j] = "td";
                }
            }

            for(var i = 0; i < children.length; i++) {
                childModel = kony.model.getWidgetModel(widgetModel.pf || widgetModel.id, children[i], context.tabpaneID);
                temp[childModel.gridCell.rowNo][childModel.gridCell.colNo] = childModel;
            }

            for(var i = 0; i < metaInfo.rows; i++) {

                for(var j = 0; j < metaInfo.cols; j++) {
                    var wModel = temp[i][j];
                    if(wModel.wType) {
                        var colSpan = wModel.gridCell.colSpan;
                        while(colSpan > 1) {
                            temp[i][++j] = "";
                            colSpan--;
                        }
                    }
                }

                for(var k = i - 1; k >= 0; k--) {
                    for(var l = 0; l < metaInfo.cols; l++) {
                        var wModel = temp[k][l];
                        if(wModel.wType && wModel.gridCell.rowSpan > i - k) {
                            temp[i][l] = "";
                            var colSpan = wModel.gridCell.colSpan;
                            while(colSpan > 1) {
                                temp[i][++l] = "";
                                colSpan--;
                            }
                        }
                    }
                }
            }
            return temp;
        }
    };


    return module;
}());
