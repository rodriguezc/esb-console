define([
    "../../dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/hermesWidget.html",
    "dojo/request",
    "dojo/_base/array",
    "dojo/topic",
    "dijit/MenuBar",
    "dijit/DropDownMenu",
    "dijit/PopupMenuBarItem",
    "dijit/MenuItem",
    "dijit/PopupMenuItem",
    "dijit/layout/ContentPane",
    "app/widget/HermesDetailsWidget",
    "dojo/hash"




], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template,
             request, array, topic, MenuBar, DropDownMenu, PopupMenuBarItem, MenuItem, PopupMenuItem, ContentPane, HermesDetailsWidget, hash) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        env: "DEFAULTENV",


        // Note: string would come from dojo/text! plugin in a 'proper' dijit
        templateString: template,


        destroy: function() {
            this.inherited(arguments);
            this.queueSelectedHandle.remove();
        },

        postCreate: function() {
            this.inherited(arguments);

            var env = this.env;
            var page = this.page;
            var broker= this.broker;

            this.centerPaneWidget.watch("selectedChildWidget", function(name, oval, nval){
                hash("env="+env+"&page="+page+"&broker="+broker+"&queue="+nval.queue);
            });



            var centerPaneWidget = this.centerPaneWidget;

            this.queueSelectedHandle= topic.subscribe("hermes/queueSelected", function(queueName){
                var found = false;
                array.forEach(centerPaneWidget.getChildren(), function (item, index) {
                    //C'est la même ligne
                    if (item.title == queueName) {
                        found = true;
                        centerPaneWidget.selectChild(item);  //Sélection du tab déjà ouvert
                    } else {
                    }
                });

                if (!found) {
                    var cp1 = new ContentPane({
                        queue: queueName,
                        title: queueName,
                        closable: true
                    });

                    centerPaneWidget.addChild(cp1);
                    centerPaneWidget.selectChild(cp1);  //Sélection du nouveau tab
                    //JSON REQUEST -> dans HermesDetailsWidget
                    request("/services/environnements/" + env + "/brokers/" + broker + "/queues/" + queueName).then(
                        function (data) {
                            var hermesDetailsWidget = new HermesDetailsWidget(data);
                            hermesDetailsWidget.placeAt(cp1);

                        },
                        function (error) {
                            console.log(error);
                        }
                    );


                }


            });


        },

        resize: function () {
            this.inherited(arguments);  //Obligatoire si on ne veut pas des effets de bord
            this.containerWidget.resize();      //WORKAROUND
        },

        _onKeyUpInputFilter: function (evt) {
            var query = this.queuesFilterInputWidget.get("value");
            this.queuesGridWidget.setQuery({name: "*" + query + "*"}, {ignoreCase: true});
        },
        _onBrokerSelect: function () {

        },
        _onRowClick: function (evt) {
            var line = this.queuesGridWidget.getItem(evt.rowIndex);
            topic.publish("hermes/queueSelected", line.name);
        }

    });

});