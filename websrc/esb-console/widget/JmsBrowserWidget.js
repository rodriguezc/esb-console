define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/JmsBrowserWidget.html",
    "dojo/request",
    "dojo/_base/array",
    "dojo/topic",
    "dijit/MenuBar",
    "dijit/DropDownMenu",
    "dijit/PopupMenuBarItem",
    "dijit/MenuItem",
    "dijit/PopupMenuItem",
    "dijit/layout/ContentPane",
    "dojo/hash",
    "dojo/store/Memory",
    "esb-console/widget/QueueDetailsWidget",
    "esb-console/utils/http",
    "dijit/Dialog"

], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template, request, array, topic, MenuBar, DropDownMenu, PopupMenuBarItem, MenuItem, PopupMenuItem, ContentPane, hash, Store, QueueDetailsWidget, http, Dialog) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {

        env: "DEFAULTENV",


        // Note: string would come from dojo/text! plugin in a 'proper' dijit
        templateString: template,


        destroy: function () {
            this.inherited(arguments);
        },

        postCreate: function () {
            this.inherited(arguments);
            var widget = this;

            widget.queueGridWidget.menu.bind(widget.contextualMenu, {"hookPoint": 'row'});
            widget._onRefresh();
        },

        resize: function () {
            this.inherited(arguments);  //Obligatoire si on ne veut pas des effets de bord
            this.containerWidget.resize();      //WORKAROUND
        },

        _onRowClick: function (evt) {
            if (evt.detail == 2) {
                var cell = this.queueGridWidget.cell(evt.rowId, evt.columnId);
                var line = cell.data();
                var newHash = "env=" + this.env + "&page=jmsBrowser&broker=" + this.broker + "&queue=" + line;
                hash(newHash);
            }
        },

        startup: function () {
            this.inherited(arguments);
        },

        focusInputFilter: function () {
            this.queueGridWidget.quickFilter.quickFilter.textBox.focus();
        },


        generateTabContent: function (hashObj, cp1) {
            if (hashObj.env != undefined && hashObj.page != undefined && hashObj.broker != undefined && hashObj.queue != undefined) {
                var data = {};
                data.env = hashObj.env;
                data.broker = hashObj.broker;
                data.queueName = hashObj.queue;
                data.haContentPane = cp1;

                var queueDetailsWidget = new QueueDetailsWidget(data);

                var tabContent = {
                    "title": hashObj.queue,
                    "widget": queueDetailsWidget
                }
                return tabContent;
            }
        },

        _onAdd: function (evt) {
            var widget = this;
            var queueToAdd = widget.addQueueInput.value;
            widget.haContentPane.addTabLoadingState();
            request("/services/environments/" + this.env + "/brokers/" + this.broker + "/queues/" + queueToAdd, {"method" : "PUT"}).then(
                function (data) {
                    widget.haContentPane.removeTabLoadingState();
                    alert(data);
                    widget._onRefresh();

                    widget.queueGridWidget.quickFilter.quickFilter.textBox.set("value", queueToAdd);
                    widget.queueGridWidget.quickFilter.quickFilter._filter();
                    widget.addDialog.hide();

                },
                function (error) {
                    widget.haContentPane.removeTabLoadingState();
                    http.handleError(error);
                }
            );
            return false;
        },


        _onDelete: function (evt) {
            var widget = this;
            console.log(widget.queueGridWidget);

            var selectedQueue = widget.queueGridWidget.menu.context.row.id;
            if (confirm("You are about to delete " + selectedQueue)) {

                widget.haContentPane.addTabLoadingState();
                request("/services/environments/" + this.env + "/brokers/" + this.broker + "/queues/" + selectedQueue, {"method" : "DELETE"}).then(
                    function (data) {
                        widget.haContentPane.removeTabLoadingState();
                        alert(data);
                        widget._onRefresh();
                    },
                    function (error) {
                        widget.haContentPane.removeTabLoadingState();
                        http.handleError(error);
                    }
                );


            } else {

            }
        },

        _onRefresh: function (evt) {

            var widget = this;

            var env = this.env;
            var broker = this.broker;
            var queueGridWidget = this.queueGridWidget;

            widget.haContentPane.addTabLoadingState();


            request("/services/environments/" + env + "/brokers/" + broker + "/queues", {handleAs: "json"}).then(
                function (text) {

                    var filterValue = queueGridWidget.quickFilter.quickFilter.textBox.get("value");

                    widget.haContentPane.removeTabLoadingState();
                    queueGridWidget.model.clearCache();
                    var store = new Store({data: text});
                    queueGridWidget.model.setStore(store);
                    queueGridWidget.body.refresh();
                    queueGridWidget.column(0).sort(false);

                    if(filterValue != null) {
                        queueGridWidget.quickFilter.quickFilter.textBox.set("value", filterValue);
                        queueGridWidget.quickFilter.quickFilter._filter();

                    }
                    widget.focusInputFilter();


                },
                function (error) {
                    widget.haContentPane.removeTabLoadingState();
                    http.handleError(error);
                }
            );


        }
    });

});