define([
    "../../dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/hermesDetailsWidget.html",
    "dojo/request",
    "dijit/Dialog",
    "dojo/_base/array",
    "dojo/store/Memory",
    "dojox/html/entities",
    "dojo/topic"


], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template, request, Dialog, array, Store, entities, topic) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // Note: string would come from dojo/text! plugin in a 'proper' dijit
        templateString: template,
        postCreate: function () {
            this.inherited(arguments);
            this._reloadMessages();
        },


        _reloadMessages : function() {
            var messagesGridWidget = this.messagesGridWidget;
            request("/services/environnements/" + this.env + "/brokers/" + this.broker + "/queues/"+this.queueName+"/messages", {"handleAs": "json"}).then(
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
            request("/services/environnements/" + this.env + "/brokers/" + this.broker + "/queues/" + this.queueName, {"handleAs": "json"}).then(
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

            var widget = this;
            var reloadMessages = this._reloadMessages;
            request("/services/environnements/" + this.env + "/brokers/" + this.broker + "/queues/" + this.queueName+"/messages/"+rowsToDelete, {"method" : "DELETE"}).then(
                function (data) {
                    widget._reloadMessages();

                },
                function (error) {
                    console.log(error);

                }
            );
        },
        _onPurgeClick: function() {

            var widget = this;

            request("/services/environnements/" + this.env + "/brokers/" + this.broker + "/queues/" + this.queueName+"/messages/all", {"method" : "DELETE"}).then(
                function (data) {
                    widget._reloadMessages();

                },
                function (error) {
                    console.log(error);

                }
            );
        },
        _onFileUploadComplete: function( data) {
            this.baseWidgetId._onRefreshClick();
        } ,
        _onRowClick : function(evt) {
            var cell = this.messagesGridWidget.cell(evt.rowId, evt.columnId);
            var msg = cell.row.model.byId(cell.row.id).item;
            console.log(msg);
            this.set("detailsContent", entities.encode(msg.content));
            this.set("detailsProperties", msg.properties);


        },
        _onCopyClick : function() {
            var rowsToDelete = this.messagesGridWidget.select.row.getSelected();

            var messagesGridWidget = this.messagesGridWidget;

            var msgs = [];

            array.forEach(rowsToDelete, function(msgId, i){
                var currentMsg = messagesGridWidget.model.byId(msgId).item;
                msgs.push(currentMsg);
                console.log(currentMsg);
            });
            topic.publish("clipboard/copy",msgs);

        },

        _onPasteClick : function() {
            var queueName = this.queueName;
            topic.publish("clipboard/action", function(msgList) {
                console.log(msgList.length + " a envoyer dans la queue "+queueName);
            });
        }
    });

});