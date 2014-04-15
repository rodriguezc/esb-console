define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/IndexWidget.html",
    "dijit/MenuBar",
    "dijit/DropDownMenu",
    "dijit/PopupMenuBarItem",
    "dijit/PopupMenuItem",
    "dijit/MenuItem",
    "dijit/layout/ContentPane",
    "dojo/hash",
    "dojo/topic",
    "dojo/io-query",
    "dojo/_base/array",
    "dojo/request",
    "esb-console/widget/BundlesWidget",
    "esb-console/widget/QueuesStatsWidget",
    "esb-console/widget/JmsBrowserWidget",
    "esb-console/widget/AuditWidget",
    "esb-console/widget/DashboardWidget",

    "dojo/dom-style"


], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template,
             MenuBar, DropDownMenu, PopupMenuBarItem, PopupMenuItem, MenuItem, ContentPane, hash, topic, ioQuery,
             array, request, BundlesWidget, QueuesStatsWidget, JmsBrowserWidget, AuditWidget,DashboardWidget, domStyle) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,

        //model
        clipboardMessagesCount: 0,
        clipboardMessages: [],
        appUser: "",
        appVersion: "",
        appEnvironment: "",

        postCreate: function () {
            this.inherited(arguments);


            var pMenuBar = new MenuBar({});
            pMenuBar.placeAt(this.navMenuNode);
            pMenuBar.startup();
            var pSubMenu = new DropDownMenu({});
            pMenuBar.addChild(new PopupMenuBarItem({
                label: "Start",
                popup: pSubMenu
            }));

            var widget = this;

            request("/services/main", {handleAs: "json"}).then(
                function (data) {
                    widget.set("mainData", data);
                    widget.set("appUser", data.application.user);
                    widget.set("appVersion", data.application.version);
                    widget.set("appEnvironment", data.application.environment);

                    array.forEach(data.environments, function (environment, i) {
                        var envId = environment.id;
                        var envName = environment.name;

                        var dropDownMenu = new DropDownMenu({});
                        array.forEach(environment.pagesGranted, function (pageGranted, i) {
                            var pageGrantedId = pageGranted.id;
                            var pageGrantedName = pageGranted.name;


                            if (pageGrantedId == "jmsBrowser") {
                                var dropDownMenuBrokers = new DropDownMenu({});

                                array.forEach(environment.brokers, function (broker, j) {
                                    var brokerId = broker.id;
                                    var brokerName = broker.name;

                                    dropDownMenuBrokers.addChild(new MenuItem({
                                        label: brokerName,
                                        onClick: function () {
                                            var newHash = "env=" + envId + "&page=jmsBrowser&broker=" + brokerId;
                                            hash(newHash);
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
                                    onClick: function () {
                                        var newHash = "env=" + envId + "&page="+pageGrantedId;
                                        hash(newHash);
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
                function (error) {
                    alert("error");
                }
            );

            topic.subscribe("clipboard/copy", function(arrayOfNewMessages){
                var clipboardMessages = widget.get("clipboardMessages");
                array.forEach(arrayOfNewMessages, function(msg, i){
                    clipboardMessages.push(msg);

                });
                var clipboardMessagesCount = widget.get("clipboardMessagesCount");

                widget.set("clipboardMessagesCount", clipboardMessagesCount+arrayOfNewMessages.length);

                domStyle.set(widget.clipboardMessagesCountWidgetBig.domNode, "position", "fixed");
                domStyle.set(widget.clipboardMessagesCountWidgetBig.domNode, "fontSize","30px");
                domStyle.set(widget.clipboardMessagesCountWidgetBig.domNode, "display","inline");

                setTimeout(function() {
                    domStyle.set(widget.clipboardMessagesCountWidgetBig.domNode, "position", "relative");
                    domStyle.set(widget.clipboardMessagesCountWidgetBig.domNode, "fontSize",null);
                    domStyle.set(widget.clipboardMessagesCountWidgetBig.domNode, "display","none");
                }, 1000);


            });

            topic.subscribe("clipboard/action", function(callback){
                var clipboardMessages = widget.get("clipboardMessages");
                callback(clipboardMessages);
            });
        },

        _onDeleteClipboard: function() {
            this.set("clipboardMessages", []);
            this.set("clipboardMessagesCount", 0);
        },

        _onViewClipboard : function() {
            alert("not implemented");
        },


        resize: function () {
            this.inherited(arguments);
            this.borderContainer.resize();
        },

        onOpenDashboardClick: function() {
            hash("page=dashboard");
        },

        generateTabContent: function (hashObj) {
            if(hashObj.env == undefined && hashObj.page != null && hashObj.page == "dashboard") {
                var dashboardWidget = new DashboardWidget();
                var tabContent = {
                    "title": "Dashboard",
                    "widget": dashboardWidget
                }
                return tabContent;
            } else if (hashObj.env != undefined && hashObj.page != undefined) {
                if ("bundles" == hashObj.page) {
                    var bundlesWidget = new BundlesWidget(
                        {
                            "env": hashObj.env
                        }
                    );
                    var tabContent = {
                        "title": hashObj.env + "- Bundles",
                        "widget": bundlesWidget
                    }
                    return tabContent;

                } else if ("queuesStats" == hashObj.page) {
                    var queuesStatsWidget = new QueuesStatsWidget(
                        {
                            "env": hashObj.env
                        }
                    );
                    var tabContent = {
                        "title": hashObj.env + "- Queues stats",
                        "widget": queuesStatsWidget
                    }
                    return tabContent;
                }  else if ("jmsBrowser" == hashObj.page) {
                    if (hashObj.broker != null) {
                        var jmsBrowserWidget = new JmsBrowserWidget(
                            {
                                "env":  hashObj.env,
                                "broker":  hashObj.broker
                            }
                        );

                        var tabContent = {
                            "title": hashObj.env + "- JMS Browser - "+hashObj.broker,
                            "widget": jmsBrowserWidget
                        }
                        return tabContent;
                    }

                } else if ("audit" == hashObj.page) {
                    var auditWidget = new AuditWidget(
                        {
                            "env":  hashObj.env
                        }
                    );

                    var tabContent = {
                        "title": hashObj.env + "- Audit",
                        "widget": auditWidget
                    }
                    return tabContent;


                }
            }
        }

    });

});