define([
    "../../dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/hermesDetailsWidget.html",
    "dojo/request"

], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template, request) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // Note: string would come from dojo/text! plugin in a 'proper' dijit
        templateString: template,
        postCreate: function () {
            this.inherited(arguments);
        },
        _onRefreshClick : function() {

            var widget = this;

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
            //rafraichir le tableau des messages
            this.messagesGridWidget.setQuery({jmsMessageId: "*"}, {ignoreCase: true});
        }
    });

});