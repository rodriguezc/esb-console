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
    "dojo/store/Memory"


], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template, request, Dialog, array, Store) {
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
                    console.log("valeuur=");

                    console.log(text);
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

            this._reloadMessages();



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
                    alert(data);
                    widget._reloadMessages();

                },
                function (error) {
                    console.log(error);

                }
            );
        }
    });

});