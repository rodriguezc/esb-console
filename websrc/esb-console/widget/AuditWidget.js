define([
        "dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_OnDijitClickMixin",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/AuditWidget.html",
        "dojo/request",
        "dojo/hash",
        "gridx/Grid",
        "dojo/store/Memory",
        "esb-console/widget/MessageDetailsWidget",
        "dojo/topic",
        "dojo/_base/array",
        "dojo/io-query",
        "esb-console/utils/hashUtils"
    ],
    function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template, request, hash, Grid, Store, MessageDetailsWidget, topic, array, ioQuery,hashUtils) {
        return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {


            currentquery: null,

            templateString: template,
            postCreate: function () {
                this.inherited(arguments);

                var widget = this;

                topic.subscribe("/dojo/hashchange", function (changedHash) {

                    var hashObj = ioQuery.queryToObject(changedHash);
                    if (widget.env == hashObj.env && "audit" == hashObj.page && hashObj.q != null && widget.currentquery != hashObj.q) {
                        widget.currentquery = hashObj.q

                        if (widget.currentquery == "") {
                            widget.requestNode.value = null;
                            var store = new Store({data: null});
                            widget.gridWidget.model.setStore(store);
                        } else {

                            request.post("/services/environments/" + widget.env + "/audit", {

                                data: widget.currentquery, handleAs: "json"}).then(
                                function (data) {
                                    //        widget.gridWidget.model.clearCache();
                                    var store = new Store({data: data});
                                    widget.gridWidget.model.setStore(store);
                                    //widget.gridWidget.body.refresh();
                                    //widget.gridWidget.column(7).sort(false);
                                },
                                function (error) {
                                    console.log(error);
                                }
                            );
                        }
                    }
                });

                this.gridWidget.onCellClick = function(evt) {

                    //Double click and click on Queue column
                    if(evt.detail == 2 && (evt.columnId==7 || evt.columnId==11)) {
                        var cell = widget.gridWidget.cell(evt.rowId, evt.columnId);
                        var line = cell.row.model.byId(cell.row.id).item;

                        var jmsQueue = line.serviceDestination;
                        if(evt.columnId==11) {
                            jmsQueue = line.ackQueue;
                        }

                        request("/services/environments/"+widget.env+"/brokers", {handleAs: "json"}).then(
                            function(text) {
                                array.forEach(text, function (broker, i) {
                                    hashUtils.changeHashParamByParam("env="+widget.env+"&page=jmsBrowser&broker="+broker.id+"&queue="+jmsQueue);
                                });
                            },
                            function(error) {
                                alert("error");
                            }
                        );
                    }
                };


            },
            startup: function () {
                this.inherited(arguments);
                this.requestNode.focus();
            },
            resize: function () {
                this.inherited(arguments);
                this.gridWidget.resize();
            },

            onCopyClick: function () {
                var rowsToDelete = this.gridWidget.select.row.getSelected();

                var messagesGridWidget = this.gridWidget;

                var msgs = [];

                array.forEach(rowsToDelete, function (msgId, i) {
                    var currentMsg = messagesGridWidget.model.byId(msgId).item;
                    msgs.push(currentMsg);
                });
                topic.publish("clipboard/copy", msgs);
            },

            onRequestChange: function (event) {

                var widget = this;
                if (event.ctrlKey) {
                    if (event.keyCode == 88) {
                        hash("env=" + this.env + "&page=audit&q=");
                    } else
                    if (event.keyCode == 13) {

                        hash("env=" + this.env + "&page=audit&q=" + this.requestNode.value);
                    }
                }
            },


            detailProvider: function (grid, rowId, detailNode, renderred) {
                var rowData = grid.model.byId(rowId).item;
                var messageDetailsWidget = new MessageDetailsWidget(
                    {
                        "detailsProperties": rowData.properties,
                        "detailsId": rowData.id,
                        "detailsContent": rowData.content
                    }
                );
                messageDetailsWidget.placeAt(detailNode);
                messageDetailsWidget.startup();
                renderred.callback();
                return renderred;

            }
        });

    });