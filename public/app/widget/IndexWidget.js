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
    "dojo/hash",
    "dojo/dom-style"
], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template, request,
             array, topic, MenuBar, DropDownMenu,PopupMenuBarItem,MenuItem, PopupMenuItem, ContentPane, HermesWidget, hash, domStyle) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,

        //model
        clipboardMessagesCount: 0,
        clipboardMessages: [],
        appUser: "",
        appVersion: "",
        appEnvironment: "",
        mainDataPromise : "",

        postCreate: function () {
            this.inherited(arguments);

            var indexWidget = this;

            var pMenuBar = new MenuBar({});
            pMenuBar.placeAt(this.navMenuNode);
            pMenuBar.startup();
            var pSubMenu = new DropDownMenu({});
            pMenuBar.addChild(new PopupMenuBarItem({
                label: "Start",
                popup: pSubMenu
            }));

            this.centerTabContainer.watch("selectedChildWidget", function(name, oval, nval){
                hash("env="+nval.env+"&page="+nval.page+"&broker="+nval.broker);
            });


            this.mainDataPromise = request("/services/main", {handleAs: "json"});
            this.mainDataPromise.then(

                function(data) {
                    indexWidget.set("mainData", data);
                    indexWidget.set("appUser", data.application.user);
                    indexWidget.set("appVersion", data.application.version);
                    indexWidget.set("appEnvironment", data.application.environment);

                    array.forEach(data.environments, function(environment, i){
                        var envId = environment.id;
                        var envName = environment.name;

                        var dropDownMenu = new DropDownMenu({});
                        array.forEach(environment.pagesGranted, function(pageGranted, i){
                            var pageGrantedId = pageGranted.id;
                            var pageGrantedName = pageGranted.name;


                            if(pageGrantedId == "jmsBrowser") {
                                var dropDownMenuBrokers = new DropDownMenu({});

                                array.forEach(environment.brokers, function(broker, j){
                                    var brokerId = broker.id;
                                    var brokerName = broker.name;

                                    dropDownMenuBrokers.addChild(new MenuItem({
                                        label: brokerName,
                                        onClick: function() {
                                            var newHash = "env="+envId+"&page=jmsBrowser&broker="+brokerId;
                                            if(decodeURI(hash()) == newHash) {
                                                   topic.publish("menu/pageSelected", envId, pageGrantedId, brokerId);

                                            } else {
                                                hash(newHash);
                                            }
                                        }
                                    }));
                                });

                                dropDownMenu.addChild(new PopupMenuItem({
                                    label: pageGrantedName,
                                    popup: dropDownMenuBrokers
                                }));



                            } else {
                                dropDownMenu.addChild(new MenuItem({
                                    label: pageGrantedName,
                                    onClick: function() {
                                        topic.publish("menu/pageSelected", envId, pageGrantedId);
                                    }
                                }));
                            }



                        });
                        pSubMenu.addChild(new PopupMenuItem({
                            label: envName,
                            popup: dropDownMenu
                        }));


                    });
                },
                function(error) {
                    alert("Error when loading main data");
                    console.log("An error occurred: " + error);
                }
            );


            topic.subscribe("menu/pageSelected", function(envId, pageId, brokerId){
                //Dès que le main data est chargé
                indexWidget.mainDataPromise.then(function() {
                    //On récupère l'environnement sélectionné
                    var env = array.filter(indexWidget.mainData.environments, function(env) {
                        return env.id = envId;
                    })[0];


                    //On récupère la page sélectionné
                    var page = array.filter(env.pagesGranted, function(pageGranted) {
                        return pageGranted.id = pageId;
                    })[0];

                    var title = env.name +"-"+page.name


                    //Si la page est le browser JMS
                    if(page.id == "jmsBrowser") {
                        //On récupère le broker sélectionné
                        var broker = array.filter(env.brokers, function(broker) {
                            return broker.id = brokerId;
                        })[0];
                        title += "-"+broker.name;
                    }
                    var found = false;


                    array.forEach(indexWidget.centerTabContainer.getChildren(), function(item, index) {
                        //C'est la même ligne
                        if(item.title == title) {
                            found = true;
                            indexWidget.centerTabContainer.selectChild(item);  //Sélection du tab déjà ouvert
                        } else {
                        }
                    });

                    if(!found) {
                        var cp1 = new ContentPane({
                            env: envId,
                            page: pageId,
                            broker: brokerId,
                            title: title,
                            closable:true
                        });
                        if(pageId == "jmsBrowser") {
                            indexWidget.centerTabContainer.addChild(cp1);
                            var hermesWidget = new HermesWidget(
                                {
                                    "env": envId,
                                    "broker": brokerId,
                                    "page": pageId

                                }
                            );
                            hermesWidget.placeAt(cp1);
                            indexWidget.centerTabContainer.selectChild(cp1);  //Sélection du tab déjà ouvert
                        }
                    }
                });

            });

            topic.subscribe("clipboard/copy", function(arrayOfNewMessages){
                var clipboardMessages = indexWidget.get("clipboardMessages");
                array.forEach(arrayOfNewMessages, function(msg, i){
                    clipboardMessages.push(msg);

                });
                var clipboardMessagesCount = indexWidget.get("clipboardMessagesCount");

                indexWidget.set("clipboardMessagesCount", clipboardMessagesCount+arrayOfNewMessages.length);

                domStyle.set(indexWidget.clipboardMessagesCountWidgetBig.domNode, "position", "fixed");
                domStyle.set(indexWidget.clipboardMessagesCountWidgetBig.domNode, "fontSize","30px");
                domStyle.set(indexWidget.clipboardMessagesCountWidgetBig.domNode, "display","inline");

                setTimeout(function() {
                    domStyle.set(indexWidget.clipboardMessagesCountWidgetBig.domNode, "position", "relative");
                    domStyle.set(indexWidget.clipboardMessagesCountWidgetBig.domNode, "fontSize",null);
                    domStyle.set(indexWidget.clipboardMessagesCountWidgetBig.domNode, "display","none");
                }, 1000);


            });

            topic.subscribe("clipboard/action", function(callback){
                var clipboardMessages = indexWidget.get("clipboardMessages");
                callback(clipboardMessages);
            });

        },

        resize: function() {
            this.inherited(arguments);
            this.borderContainer.resize();
        },

        _onDeleteClipboard: function() {
            this.set("clipboardMessages", []);
            this.set("clipboardMessagesCount", 0);
        }

    });

});