define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/QueueDetailsWidget.html",
    "dojo/request",
    "dijit/Dialog",
    "dojo/_base/array",
    "dojo/store/Memory",
    "dojox/html/entities",
    "dojo/topic","dojo/dom-style",
    "dojo/dom-form",
    "esb-console/utils/http"



], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template, request,
             Dialog, array, Store, entities, topic, domStyle, domForm, http) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // Note: string would come from dojo/text! plugin in a 'proper' dijit
        templateString: template,
        postCreate: function () {
            this.inherited(arguments);
            this._onRefreshClick();
        },

        resize: function () {
            this.inherited(arguments);  //Obligatoire si on ne veut pas des effets de bord
            this.messagesGridWidget.resize();      //WORKAROUND
        },

        destroy: function() {
            this.inherited(arguments);
        },

        detailsText: "- no row selected -",


        _reloadMessages : function() {
            var messagesGridWidget = this.messagesGridWidget;
            var widget = this;
            widget.haContentPane.addTabLoadingState();
            request("/services/environments/" + this.env + "/brokers/" + this.broker + "/queues/"+this.queueName+"/messages", {"handleAs": "json"}).then(
                function (text) {
                    widget.haContentPane.removeTabLoadingState();
                    messagesGridWidget.model.clearCache();
                    var store = new Store({data: text});
                    messagesGridWidget.model.setStore(store);
                    messagesGridWidget.body.refresh();

                },
                function (error) {
                    widget.haContentPane.removeTabLoadingState();
                    http.handleError(error);
                }
            );
        },

        onExportClick: function() {
            var rowsToExport = this.messagesGridWidget.select.row.getSelected();
            var messagesGridWidget = this.messagesGridWidget;
            var msgs = [];
            array.forEach(rowsToExport, function (msgId, i) {
                var currentMsg = messagesGridWidget.model.byId(msgId).item;
                msgs.push(currentMsg);
            });
            this.exportTextAreaNode.value = JSON.stringify(msgs, null, 4);
            this.exportDialog.show();
        },


        _onRefreshClick : function() {
            var widget = this;
            widget._reloadMessages();
            //rafraichir les stats jmx
            widget.haContentPane.addTabLoadingState();

            request("/services/environments/" + this.env + "/brokers/" + this.broker + "/queues/" + this.queueName, {"handleAs": "json"}).then(
                function (data) {
                    widget.haContentPane.removeTabLoadingState();
                    widget.set("size", data.size);
                    widget.set("consumers", data.consumers);
                    widget.set("consumersSize", data.consumersSize);
                    widget.set("dequeue", data.dequeue);
                    widget.set("enqueue", data.enqueue);
                    widget.set("inflight", data.inflight);
                    widget.set("averageEnqueueTime", data.averageEnqueueTime);
                    widget.set("memoryLimit", data.memoryLimit);
                    widget.memLimitInput.attr("value", data.memoryLimit);

                },
                function (error) {
                    widget.haContentPane.removeTabLoadingState();
                    http.handleError(error);
                }
            );
        },

        _onDeleteClick: function() {

            var rowsToDelete = this.messagesGridWidget.select.row.getSelected();

            if(rowsToDelete.length == 0) {
                alert("There is no message selected");
            }  else {
                if(confirm("You are about to delete "+rowsToDelete.length+" msgs from the queue "+this.queueName)) {
                    var widget = this;
                    var reloadMessages = this._reloadMessages;

                    widget.haContentPane.addTabLoadingState();

                    request.post("/services/environments/" + widget.env + "/brokers/" + widget.broker + "/queues/" + widget.queueName+"/messages/delete", {
                        headers: {"Content-Type": "application/json"}, data: JSON.stringify(rowsToDelete)}).then(
                        function (data) {
                            widget.haContentPane.removeTabLoadingState();
                            alert(data);
                            widget._onRefreshClick();

                        },
                        function (error) {
                            widget.haContentPane.removeTabLoadingState();
                            http.handleError(error);
                        }
                    );
                }
            }
        },
        _onPurgeClick: function() {


            if(confirm("You are about to purge the queue "+this.queueName)) {
                var widget = this;
                widget.haContentPane.addTabLoadingState();
                request("/services/environments/" + this.env + "/brokers/" + this.broker + "/queues/" + this.queueName+"/messages/all", {"method" : "DELETE"}).then(
                    function (data) {
                        widget.haContentPane.removeTabLoadingState();
                        alert(data);
                        widget._reloadMessages();
                    },
                    function (error) {
                        widget.haContentPane.removeTabLoadingState();
                        http.handleError(error);
                    }
                );
            }
        },
        _onFileUploadComplete: function( data) {
            this.baseWidgetId._onRefreshClick();
        } ,
        _onRowClick : function(evt) {
            if(evt.detail == 2) {
                var cell = this.messagesGridWidget.cell(evt.rowId, evt.columnId);
                var msg = cell.row.model.byId(cell.row.id).item;
                var posId =cell.row.model.byId(cell.row.id).data["1"];
                //    this.set("detailsContent", entities.encode(msg.content));
                this.set("detailsContent", msg.content);

                this.set("detailsProperties", msg.properties);
                this.set("detailsId", msg.id);
                this.set("detailsText", posId);

            }
        },
        _onCopyClick : function() {
            var rowsToDelete = this.messagesGridWidget.select.row.getSelected();

            var messagesGridWidget = this.messagesGridWidget;

            var msgs = [];

            array.forEach(rowsToDelete, function(msgId, i){
                var currentMsg = messagesGridWidget.model.byId(msgId).item;
                msgs.push(currentMsg);
            });
            topic.publish("clipboard/copy",msgs);

        },

        _onPasteClick : function() {
            var widget = this;
            topic.publish("clipboard/action", function(msgList) {

                if(msgList.length == 0) {
                    alert("there is no message in the clipboard");
                }else

                if(confirm("Your are about to paste "+msgList.length +" msgs to the queue "+widget.queueName)) {

                    widget.haContentPane.addTabLoadingState();
                    request.post("/services/environments/" + widget.env + "/brokers/" + widget.broker + "/queues/" + widget.queueName+"/messages",
                        {
                            headers: {"Content-Type": "application/json"},
                            data: JSON.stringify(msgList)}).then(
                        function (data) {
                            widget.haContentPane.removeTabLoadingState();
                            alert(data);
                            widget._onRefreshClick();

                        },
                        function (error) {
                            widget.haContentPane.removeTabLoadingState();
                            http.handleError(error);
                        }
                    );
                }


            });
        },
        _onCopyCurrentClick : function() {
            if(this.detailsText != "- no row selected -") {
                var msg = this.messagesGridWidget.model.byId(this.detailsId).item;
                var msgs = [];
                msgs.push(msg);
                topic.publish("clipboard/copy",msgs);
            }
        },


        detailsState : "default",
        _onPropertiesExpand : function() {
            if(this.detailsState =="default") {
                domStyle.set(this.fieldsetProperties, "width", "90%");
                domStyle.set(this.fieldsetContent, "display", "none");
                this.set("detailsState", "propertiesMax");
            }
        },
        _onPropertiesContract : function() {
            if(this.detailsState =="propertiesMax") {
                domStyle.set(this.fieldsetProperties, "width", "30%");
                domStyle.set(this.fieldsetContent, "display", "block");
                this.set("detailsState", "default");
            }  else if(this.detailsState =="default") {
                domStyle.set(this.fieldsetProperties, "display", "none");
                domStyle.set(this.fieldsetContent, "width", "90%");
                this.set("detailsState", "propertiesMin");
            }  else if(this.detailsState =="propertiesMin") {
                domStyle.set(this.fieldsetContent, "width", "60%");
                domStyle.set(this.fieldsetProperties, "width", "30%");
                domStyle.set(this.fieldsetContent, "display", "block");
                this.set("detailsState", "default");
            }
        },

        _onContentExpand : function() {
            if(this.detailsState =="default") {
                domStyle.set(this.fieldsetContent, "width", "90%");
                domStyle.set(this.fieldsetProperties, "display", "none");
                this.set("detailsState", "propertiesMax");
            }
        },

        _onContentContract : function(evt) {
            if(this.detailsState =="propertiesMax") {
                domStyle.set(this.fieldsetContent, "width", "60%");
                domStyle.set(this.fieldsetProperties, "display", "block");
                this.set("detailsState", "default");
            }  else if(this.detailsState =="default") {
                domStyle.set(this.fieldsetContent, "display", "none");
                domStyle.set(this.fieldsetProperties, "width", "90%");
                this.set("detailsState", "propertiesMin");
            }  else if(this.detailsState =="propertiesMin") {
                domStyle.set(this.fieldsetContent, "width", "60%");
                domStyle.set(this.fieldsetProperties, "width", "30%");
                domStyle.set(this.fieldsetProperties, "display", "block");
                this.set("detailsState", "default");
            }
        },

        _onOpenMoveAll: function() {
            this.moveType ="all";
            this._onOpenMove();
        } ,

        _onOpenMoveSelection : function() {
            var rowsToDelete = this.messagesGridWidget.select.row.getSelected();
            if(rowsToDelete.length == 0) {
                alert("There is no message selected");
            } else {
                this.moveType ="selection";
                this._onOpenMove();
            }
        } ,

        _onOpenMove: function() {
            this.firstMoveOpen = true;
            var widget = this;
            widget.haContentPane.addTabLoadingState();

            request("/services/environments", {handleAs: "json"}).then(
                function(text) {
                    widget.haContentPane.removeTabLoadingState();
                    widget.envStore.data = text;
                    var currentEnv = widget.envStore.query({"id": widget.env});
                    widget.filteringSelectEnvWidget.set("item", currentEnv[0]);
                },
                function(error) {
                    widget.haContentPane.removeTabLoadingState();
                    http.handleError(error);
                }
            );
            this.moveSelectionDialog.show();
        } ,

        _onMove : function(evt) {
            evt.preventDefault();
            evt.stopPropagation();

            var widget = this;
            if(this.moveType == "selection") {
                var rowsToDelete = this.messagesGridWidget.select.row.getSelected();
                if(rowsToDelete.length ==0) {
                    alert("no row selected");
                } else {
                    if(confirm("you are about to move "+rowsToDelete.length+" messages")) {
                        var formJson = domForm.toObject(this.moveForm);
                        var postData = {};
                        postData.destination = formJson;
                        postData.msgs = rowsToDelete;
                        var postDataStr = JSON.stringify(postData);

                        widget.haContentPane.addTabLoadingState();
                        request.post("/services/environments/" + this.env + "/brokers/" + this.broker + "/queues/" + this.queueName+"/messages/move/selection", {
                            headers: {"Content-Type": "application/json"},
                            data: postDataStr}).then(
                            function(text) {
                                widget.haContentPane.removeTabLoadingState();
                                widget._onRefreshClick();
                                topic.publish("hermes/queueRefresh", postData.destination.env, postData.destination.broker, postData.destination.queue);
                                alert(text);

                            },
                            function(error) {
                                widget.haContentPane.removeTabLoadingState();
                                http.handleError(error);
                            }
                        );

                    }
                }
            } else {
                if(confirm("you are about to move all messages")) {
                    var formJson = domForm.toObject(this.moveForm);
                    var postData = {};
                    postData.destination = formJson;
                    var postDataStr = JSON.stringify(postData);
                    widget.haContentPane.addTabLoadingState();
                    request.post("/services/environments/" + this.env + "/brokers/" + this.broker + "/queues/" + this.queueName+"/messages/move/all",
                        {
                            headers: {"Content-Type": "application/json"},
                            data: postDataStr}).then(
                        function(text) {
                            widget.haContentPane.removeTabLoadingState();
                            widget._onRefreshClick();
                            alert(text);
                        },
                        function(error) {
                            widget.haContentPane.removeTabLoadingState();
                            http.handleError(error);
                        }
                    );
                }
            }


        },


        _onSelectEnv : function(env) {

            var widget = this;

            var brokersStore = this.brokersStore;
            this.filteringSelectBrokerWidget.attr("value", null);
            this.filteringSelectQueueWidget.attr("value", null);
            widget.haContentPane.addTabLoadingState();
            request("/services/environments/"+env+"/brokers", {handleAs: "json"}).then(
                function(text) {
                    widget.haContentPane.removeTabLoadingState();
                    brokersStore.data = text;
                    if(widget.firstMoveOpen) {
                        var currentBroker = brokersStore.query({"id": widget.broker});
                        widget.filteringSelectBrokerWidget.set("item", currentBroker[0]);
                    }
                },
                function(error) {
                    widget.haContentPane.removeTabLoadingState();
                    http.handleError(error);
                }
            );
        },

        _onSelectBroker : function(broker) {
            //condition because of attr(value, null) when changing env
            if(broker != null && "" != broker) {
                var env = this.filteringSelectEnvWidget.value;
                this.filteringSelectQueueWidget.attr("value", null);
                var brokersStore = this.brokersStore;
                var widget = this;
                widget.haContentPane.addTabLoadingState();
                request("/services/environments/"+env+"/brokers/"+broker+"/queues", {handleAs: "json"}).then(
                    function(text) {
                        widget.haContentPane.removeTabLoadingState();
                        queuesStore.data = text;
                        if(widget.firstMoveOpen) {
                            var currentQueue = queuesStore.query({"id": widget.queueName});
                            widget.filteringSelectQueueWidget.set("item", currentQueue[0]);
                            widget.firstMoveOpen = false;
                        }


                    },
                    function(error) {
                        widget.haContentPane.removeTabLoadingState();
                        http.handleError(error);
                    }
                );
            }
        },
        _onUpdateMemoryLimit : function(evt) {
            var widget = this;

            if(evt.keyCode == 13) {
                var newMemoryLimit = widget.memLimitInput.attr("value");
                if(confirm("You are about to update memory limit to "+newMemoryLimit+" for the queue "+widget.queueName)) {
                    var widget = this;
                    widget.haContentPane.addTabLoadingState();
                    request("/services/environments/" + widget.env + "/brokers/" + widget.broker + "/queues/" + widget.queueName+"/memoryLimit/"+newMemoryLimit, {"method" : "POST"}).then(
                        function (data) {
                            widget.haContentPane.removeTabLoadingState();
                            alert(data);
                            widget._reloadMessages();
                        },
                        function (error) {
                            widget.haContentPane.removeTabLoadingState();
                            http.handleError(error);
                        }
                    );
                }



            }
        }



    });

});