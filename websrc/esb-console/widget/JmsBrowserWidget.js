define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/jmsBrowserWidget.html",
    "dojo/request",
    "dojo/_base/array",
    "dojo/topic",
    "dijit/MenuBar",
    "dijit/DropDownMenu",
    "dijit/PopupMenuBarItem",
    "dijit/MenuItem",
    "dijit/PopupMenuItem",
    "dijit/layout/ContentPane",
    "esb-console/widget/QueueDetailsWidget",
    "dojo/hash",
    "dojo/store/Memory"




], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template,
             request, array, topic, MenuBar, DropDownMenu, PopupMenuBarItem, MenuItem, PopupMenuItem,
             ContentPane, QueueDetailsWidget, hash,Store) {
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
            var centerPaneWidget = this.centerPaneWidget;

            var queueGridWidget = this.queueGridWidget;

            request("/services/environments/"+env+"/brokers/"+broker+"/queues", {handleAs: "json"}).then(
                function(text) {
                    queueGridWidget.model.clearCache();
                    var store = new Store({data: text});
                    queueGridWidget.model.setStore(store);
                    queueGridWidget.body.refresh();
                    queueGridWidget.column(0).sort(false);


                },
                function(error) {
                    alert("error");
                    console.log(queueGridWidget);
                }
            );

            this.centerPaneWidget.watch("selectedChildWidget", function(name, oval, nval){
                hash("env="+env+"&page="+page+"&broker="+broker+"&queue="+nval.queue);
            });

            this.queueSelectedHandle= topic.subscribe("hermes/queueSelected", function(envP, pageP, brokerP, queueName){
                if(env == envP && page == pageP && broker == brokerP) {
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
                        //JSON REQUEST -> dans QueueDetailsWidget
                        request("/services/environments/" + env + "/brokers/" + broker + "/queues/" + queueName, {"handleAs": "json"}).then(
                            function (data) {
                                data.env = env;
                                data.broker = broker;
                                data.queueName = queueName;

                                var queueDetailsWidget = new QueueDetailsWidget(data);
                                queueDetailsWidget.placeAt(cp1);
                            },
                            function (error) {
                                console.log(error);

                            }
                        );
                    }
                }
            });


        },

        resize: function () {
            this.inherited(arguments);  //Obligatoire si on ne veut pas des effets de bord
            this.containerWidget.resize();      //WORKAROUND
        },

        _onRowClick: function (evt) {
            var cell = this.queueGridWidget.cell(evt.rowId, evt.columnId);
            var line = cell.data();
            var newHash = "env="+ this.env +"&page="+this.page+"&broker="+this.broker+"&queue="+line;
            if(decodeURI(hash()) == newHash) {
                topic.publish("hermes/queueSelected", this.env, this.page, this.broker, line);

            } else {
                hash(newHash);
            }
        }

    });

});