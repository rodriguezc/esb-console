define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/queueDetailsWidget.html",
    "dojo/request",
    "dijit/Dialog",
    "dojo/_base/array",
    "dojo/store/Memory",
    "dojox/html/entities",
    "dojo/topic","dojo/dom-style",
    "dojo/dom-form"



], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template, request, Dialog, array, Store, entities, topic, domStyle, domForm) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // Note: string would come from dojo/text! plugin in a 'proper' dijit
        templateString: template,
        postCreate: function () {
            this.inherited(arguments);
            this._reloadMessages();

            var widget = this;

            this.queueRefreshHandle= topic.subscribe("hermes/queueRefresh", function(env, broker, queueName){

                if (widget.env == env && widget.broker == broker && widget.queueName == queueName) {
                    widget._onRefreshClick();
                }

            });
        },

        destroy: function() {
            this.inherited(arguments);
            this.queueRefreshHandle.remove();
        },

        detailsId: "- no row selected -",


        _reloadMessages : function() {
            var messagesGridWidget = this.messagesGridWidget;
            request("/services/environments/" + this.env + "/brokers/" + this.broker + "/queues/"+this.queueName+"/messages", {"handleAs": "json"}).then(
                function (text) {
                    messagesGridWidget.model.clearCache();
                    var store = new Store({data: text});
                    messagesGridWidget.model.setStore(store);
                    messagesGridWidget.body.refresh();

                },
                function (error) {
                    console.log(error);

                }
            );
        },


        _onRefreshClick : function() {
            var widget = this;
            widget._reloadMessages();
            //rafraichir les stats jmx
            request("/services/environments/" + this.env + "/brokers/" + this.broker + "/queues/" + this.queueName, {"handleAs": "json"}).then(
                function (data) {
                    widget.set("size", data.size);
                    widget.set("consumers", data.consumers);
                    widget.set("dequeue", data.dequeue);
                    widget.set("enqueue", data.enqueue);
                    widget.set("inflight", data.inflight);
                    widget.set("averageEnqueueTime", data.averageEnqueueTime);
                    widget.set("memoryLimit", data.memoryLimit);

                },
                function (error) {
                    console.log(error);

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


                    request.post("/services/environments/" + widget.env + "/brokers/" + widget.broker + "/queues/" + widget.queueName+"/messages/delete", {
                        headers: {"Content-Type": "application/json"}, data: JSON.stringify(rowsToDelete)}).then(
                        function (data) {
                            alert(data);
                            widget._onRefreshClick();

                        },
                        function (error) {
                            console.log(error);
                        }
                    );
                }
           }
        },
        _onPurgeClick: function() {


            if(confirm("You are about to purge the queue "+this.queueName)) {
                var widget = this;
                request("/services/environments/" + this.env + "/brokers/" + this.broker + "/queues/" + this.queueName+"/messages/all", {"method" : "DELETE"}).then(
                    function (data) {
                        alert(data);
                        widget._reloadMessages();
                    },
                    function (error) {
                        console.log(error);

                    }
                );
            }
        },
        _onFileUploadComplete: function( data) {
            this.baseWidgetId._onRefreshClick();
        } ,
        _onRowClick : function(evt) {
            var cell = this.messagesGridWidget.cell(evt.rowId, evt.columnId);
            var msg = cell.row.model.byId(cell.row.id).item;
        //    this.set("detailsContent", entities.encode(msg.content));
            this.set("detailsContent", msg.content);

            this.set("detailsProperties", msg.properties);
            this.set("detailsId", msg.id);



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
                    request.post("/services/environments/" + widget.env + "/brokers/" + widget.broker + "/queues/" + widget.queueName+"/messages",
                        {
                            headers: {"Content-Type": "application/json"},
                            data: JSON.stringify(msgList)}).then(
                        function (data) {
                            alert(data);
                            widget._onRefreshClick();

                        },
                        function (error) {
                            console.log(error);
                        }
                    );
                }


            });
        },
        _onCopyCurrentClick : function() {
            if(this.detailsId != "- no row selected -") {
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
            this.moveType ="selection";
            this._onOpenMove();
        } ,

        _onOpenMove: function() {
            var envStore = this.envStore;
            request("/services/environments", {handleAs: "json"}).then(
                function(text) {
                    envStore.data = text;
                },
                function(error) {
                    alert("error");
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

                        request.post("/services/environments/" + this.env + "/brokers/" + this.broker + "/queues/" + this.queueName+"/messages/move/selection", {
                            headers: {"Content-Type": "application/json"},
                            data: postDataStr}).then(
                            function(text) {
                                widget._onRefreshClick();
                                topic.publish("hermes/queueRefresh", postData.destination.env, postData.destination.broker, postData.destination.queue);
                                alert(text);

                            },
                            function(error) {
                                alert("error");
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
                    request.post("/services/environments/" + this.env + "/brokers/" + this.broker + "/queues/" + this.queueName+"/messages/move/all",
                        {
                        headers: {"Content-Type": "application/json"},
                        data: postDataStr}).then(
                        function(text) {
                            widget._onRefreshClick();
                            alert(text);
                        },
                        function(error) {
                            alert("error");
                        }
                    );
                }
            }


        },


        _onSelectEnv : function(env) {
            var brokersStore = this.brokersStore;
            this.filteringSelectBrokerWidget.attr("value", null);
            this.filteringSelectQueueWidget.attr("value", null);
            request("/services/environments/"+env+"/brokers", {handleAs: "json"}).then(
                function(text) {
                    brokersStore.data = text;
                },
                function(error) {
                    alert("error");
                }
            );
        },

        _onSelectBroker : function(broker) {
            //condition because of attr(value, null) when changing env
            if(broker != null && "" != broker) {
                var env = this.filteringSelectEnvWidget.value;
                this.filteringSelectQueueWidget.attr("value", null);
                var brokersStore = this.brokersStore;
                request("/services/environments/"+env+"/brokers/"+broker+"/queues", {handleAs: "json"}).then(
                    function(text) {
                        queuesStore.data = text;
                    },
                    function(error) {
                        alert("error");
                    }
                );
            }
        }


    });

});