define([
    "../../dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/IndexWidget.html",
    "dojo/request",
    "dojo/_base/array",
    "dojo/topic",
    "dijit/MenuBar",
    "dijit/DropDownMenu",
    "dijit/PopupMenuBarItem",
    "dijit/MenuItem",
    "dijit/PopupMenuItem",
    "dijit/layout/ContentPane",
    "app/widget/HermesWidget",
    "dojo/hash"
], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template, request,
             array, topic, MenuBar, DropDownMenu,PopupMenuBarItem,MenuItem, PopupMenuItem, ContentPane, HermesWidget, hash) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,

        postCreate: function () {
            this.inherited(arguments);
            var pMenuBar = new MenuBar({});
            pMenuBar.placeAt(this.navMenuNode);
            pMenuBar.startup();

            var pSubMenu = new DropDownMenu({});
            pMenuBar.addChild(new PopupMenuBarItem({
                label: "Environnements",
                popup: pSubMenu
            }));




            this.centerTabContainer.watch("selectedChildWidget", function(name, oval, nval){
                hash("env="+nval.env+"&page="+nval.page+"&broker="+nval.broker);
            });





            request("/services/environnements", {handleAs: "json"}).then(
                function(text) {
                    array.forEach(text.environnements, function(environnement, i){

                        var dropDownMenu = new DropDownMenu({});
                        array.forEach(environnement.pagesGranted, function(pageGranted, i){

                            if(pageGranted == "Hermes like") {


                                var dropDownMenuBrokers = new DropDownMenu({});

                                array.forEach(environnement.brokers, function(broker, j){
                                    dropDownMenuBrokers.addChild(new MenuItem({
                                        label: broker,
                                        onClick: function() {

                                            hash("env="+environnement.name+"&page=Hermes like&broker="+broker);

                                            //    topic.publish("menu/pageSelected", environnement.name, pageGranted, broker);
                                        }
                                    }));
                                });

                                dropDownMenu.addChild(new PopupMenuItem({
                                    label: "Hermes like",
                                    popup: dropDownMenuBrokers
                                }));



                            } else {
                                dropDownMenu.addChild(new MenuItem({
                                    label: pageGranted,
                                    onClick: function() {
                                        topic.publish("menu/pageSelected", environnement.name, pageGranted);
                                    }
                                }));
                            }



                        });
                        pSubMenu.addChild(new PopupMenuItem({
                            label: environnement.name,
                            popup: dropDownMenu
                        }));


                    });
                },
                function(error) {
                    console.log("An error occurred: " + error);
                }
            );


            var centerTabContainer = this.centerTabContainer;

            topic.subscribe("menu/pageSelected", function(environnement, nom, broker){

                var title = environnement +"-"+nom

                if(nom == "Hermes like") {
                    title += "-"+broker;
                }

                var found = false;

                array.forEach(centerTabContainer.getChildren(), function(item, index) {
                    //C'est la même ligne
                    if(item.title == title) {
                        found = true;
                        centerTabContainer.selectChild(item);  //Sélection du tab déjà ouvert
                    } else {
                    }
                });
                if(!found) {
                    if(nom == "Hermes like") {
                        var cp1 = new ContentPane({
                            env: environnement,
                            page: nom,
                            broker: broker,
                            title: environnement+"-"+nom+"-"+broker,
                            closable:true
                        });
                        centerTabContainer.addChild(cp1);
                        var hermesWidget = new HermesWidget(
                            {
                                "env": environnement,
                                "broker": broker,
                                "page": "Hermes like"

                            }
                        );
                        hermesWidget.placeAt(cp1);
                        centerTabContainer.selectChild(cp1);  //Sélection du tab déjà ouvert

                    } else {
                        var cp1 = new ContentPane({
                            env: environnement,
                            page: nom,
                            title: environnement+"-"+nom,
                            closable:true,
                            selected:true
                        });
                        centerTabContainer.addChild(cp1);
                        centerTabContainer.selectChild(cp1);  //Sélection du tab déjà ouvert
                    }
                }




            });

        },

        resize: function() {
            this.inherited(arguments);
            this.borderContainer.resize();
        }

    });

});