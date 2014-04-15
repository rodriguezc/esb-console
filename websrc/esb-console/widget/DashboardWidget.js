define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/DashboardWidget.html",
    "dijit/MenuBar",
    "dijit/DropDownMenu",
    "dijit/PopupMenuBarItem",
    "dijit/MenuItem",
    "dijit/layout/ContentPane",
    "dojo/hash",
    "dojo/topic",
    "dojo/io-query",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dojo/request"
], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template,
             MenuBar, DropDownMenu, PopupMenuBarItem, MenuItem, ContentPane, hash, topic, ioQuery, array, domConstruct, request) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        postCreate: function () {
            this.inherited(arguments);
            this.refresh();

            var widget = this;

            this.topicHandle = topic.subscribe("/esb-console/monitoringdata", function(data){
                widget.set("lastUpdate", data.lastUpdate);
                widget.set("globalInfo", data.globalInfo);
                widget.set("environments", data.state);
            });

        },

        refresh: function() {
            var widget = this;
            request("/services/monitoring/state", {handleAs: "json"}).then(
                function (data) {
                    widget.set("lastUpdate", data.lastUpdate);
                    widget.set("environments", data.state);
                    topic.publish("/esb-console/monitoringdata", data);
                },
                function (error) {
                    alert("error");
                }
            );
        },

        resize: function () {
            this.inherited(arguments);
        },

        destroy: function() {
            this.inherited(arguments);
            this.topicHandle.remove();
        }
    });
});