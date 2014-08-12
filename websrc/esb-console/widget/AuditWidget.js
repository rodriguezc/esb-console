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
        "esb-console/utils/hashUtils",
        "esb-console/utils/http",
        "dojo/date/locale"
    ],
    function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template, request,
              hash, Grid, Store, MessageDetailsWidget, topic, array, ioQuery, hashUtils, http, locale) {
        return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {


            currentquery: null,

            templateString: template,
            postCreate: function () {
                this.inherited(arguments);

                var widget = this;

                this.hashChangeHandle=topic.subscribe("/dojo/hashchange", function (changedHash) {

                    var hashObj = ioQuery.queryToObject(changedHash);
                    if (widget.env == hashObj.env && "audit" == hashObj.page && hashObj.q != null && (widget.currentquery != hashObj.q || hashObj.q == "") ) {
                        widget.currentquery = hashObj.q

                        if (widget.currentquery == "") {
                            widget.requestNode.value = null;
                            var store = new Store({data: null});
                            widget.gridWidget.model.setStore(store);
                        } else {
                            widget.requestNode.value = widget.currentquery;

                            var startTime = new Date().getTime();


                            widget.resultLabel.innerHTML = "Search in progress..."
                            request.post("/services/environments/" + widget.env + "/audit", {
                            headers: {"Content-Type": "text/plain"},
                                data:  widget.currentquery, handleAs: "json"}).then(
                                function (data) {
                                    widget.resultLabel.innerHTML = data.length + ' records displayed. Search took ' + (new Date().getTime() - startTime)+" ms";
                                    //        widget.gridWidget.model.clearCache();
                                    var store = new Store({data: data});
                                    widget.gridWidget.model.setStore(store);

                                    //widget.gridWidget.body.refresh();
                                    //widget.gridWidget.column(7).sort(false);
                                },
                                function (error) {
                                    http.handleError(error);
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
                                http.handleError(error);
                            }
                        );
                    }
                };


            },

            destroy: function () {
                this.inherited(arguments);
                this.hashChangeHandle.remove();
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


            onSearch: function(event) {
                var newHash = "env=" + this.env + "&page=audit&q=" + this.requestNode.value;

                if(hash() == newHash) {
                    this.currentquery = null;
                    topic.publish("/dojo/hashchange", hash());
                } else {
                    hash(newHash);
                }

                this.requestNode.focus();
            },

            onRequestChange: function (event) {

                var widget = this;
                if (event.ctrlKey) {
                    if (event.keyCode == 88) {
                        var newHash = "env=" + this.env + "&page=audit&q=";
                        if(hash() == newHash) {
                            this.currentquery = null;
                            topic.publish("/dojo/hashchange", newHash);

                        } else {
                            hash("env=" + this.env + "&page=audit&q=");
                        }
                    } else
                    if (event.keyCode == 13) {
                        this.onSearch();
                    }
                }
            },

            onExportClick: function() {
                var rowsToExport = this.gridWidget.select.row.getSelected();
                var messagesGridWidget = this.gridWidget;
                var msgs = [];
                array.forEach(rowsToExport, function (msgId, i) {
                    var currentMsg = messagesGridWidget.model.byId(msgId).item;
                    msgs.push(currentMsg);
                });
                this.exportTextAreaNode.value = JSON.stringify(msgs, null, 4);
                this.exportDialog.show();
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

            },


            _onSelectType : function(env) {
                if("sendDate" == this.typeCriterion.value) {

                    var val = locale.format(new Date(),{
                        "datePattern" : "yyyy-MM-dd'T'HH:mm:ss"
                    });
                    var dateToSet = val.split(",")[0];

                    this.valueCriterion.set("value", dateToSet);
                }
            },

            onAddCriterion : function() {
                var type =  this.typeCriterion.get("value");
                var comparator =  this.comparatorCriterion.get("value");
                var value = this.valueCriterion.get("value");



                if(this.requestNode.value == null || this.requestNode.value.length == 0) {
                    this.requestNode.value = "{}";
                }

                try {
                    var node = JSON.parse( this.requestNode.value);
                }catch(err) {
                    var node = {};
                }

                if(node.$and == null) {
                    node = {};
                    node.$and = [];
                }


                if(comparator == '=') {
                    if("businessId / businessCorrelationId" == type) {
                        var criterion = {};
                        criterion.$or = [];
                        criterion.$or.push({"businessId" : value});
                        criterion.$or.push({"businessCorrelationId" : value});
                        node.$and.push(criterion);
                    } else {
                        var criterion = {};
                        criterion[type] = value;
                        node.$and.push(criterion);
                    }

                } else if(comparator == '!=') {
                    if("businessId / businessCorrelationId" == type) {
                        var criterion = {};
                        criterion.$and = [];
                        criterion.$and.push({"businessId" : {$ne: value}});
                        criterion.$and.push({"businessCorrelationId" : {$ne: value}});
                        node.$and.push(criterion);
                    } else {
                        var criterion = {};
                        criterion[type] ={"$ne": value};
                        node.$and.push(criterion);
                    }
                } else if(comparator == '>') {
                    if("businessId / businessCorrelationId" == type) {
                        var criterion = {};
                        criterion.$and = [];
                        criterion.$and.push({"businessId" : {"$gt": value}});
                        criterion.$and.push({"businessCorrelationId" : {"$gt": value}});
                        node.$and.push(criterion);
                    } else {
                        var criterion = {};
                        criterion[type] ={"$gt": value};
                        node.$and.push(criterion);
                    }

                } else if(comparator == '>=') {
                    if("businessId / businessCorrelationId" == type) {
                        var criterion = {};
                        criterion.$and = [];
                        criterion.$and.push({"businessId" : {"$gte": value}});
                        criterion.$and.push({"businessCorrelationId" : {"$gte": value}});
                        node.$and.push(criterion);
                    } else {
                        var criterion = {};
                        criterion[type] ={"$gte": value};
                        node.$and.push(criterion);
                    }

                }

                else if(comparator == '<') {
                    if("businessId / businessCorrelationId" == type) {
                        var criterion = {};
                        criterion.$and = [];
                        criterion.$and.push({"businessId" : {"$lt": value}});
                        criterion.$and.push({"businessCorrelationId" : {"$lt": value}});
                        node.$and.push(criterion);
                    } else {
                        var criterion = {};
                        criterion[type] ={"$lt": value};
                        node.$and.push(criterion);
                    }
                }   else if(comparator == '<=') {
                    if("businessId / businessCorrelationId" == type) {
                        var criterion = {};
                        criterion.$and = [];
                        criterion.$and.push({"businessId" : {"$lte": value}});
                        criterion.$and.push({"businessCorrelationId" : {"$lte": value}});
                        node.$and.push(criterion);
                    } else {
                        var criterion = {};
                        criterion[type] ={"$lte": value};
                        node.$and.push(criterion);
                    }
                }
                else if(comparator == 'like') {
                    if("businessId / businessCorrelationId" == type) {
                        var criterion = {};
                        criterion.$or= [];
                        criterion.$or.push({"businessId" : {"$regex": "^"+value+".*"}});
                        criterion.$or.push({"businessCorrelationId" : {"$regex": "^"+value+".*"}});
                        node.$and.push(criterion);
                    } else {
                        var criterion = {};
                        criterion[type] ={"$regex":  "^"+value+".*"};
                        node.$and.push(criterion);
                    }
                }

                this.requestNode.value = JSON.stringify(node);
                this.requestNode.focus();

                return false;
            }

        });

    });