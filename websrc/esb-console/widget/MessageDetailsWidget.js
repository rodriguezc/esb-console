define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/MessageDetailsWidget.html",
    "dojo/request",
    "dijit/Dialog",
    "dojo/_base/array",
    "dojo/store/Memory",
    "dojox/html/entities",
    "dojo/topic", "dojo/dom-style","dojo/_base/event"



], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template, request, Dialog, array, Store, entities, topic, domStyle, event) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // Note: string would come from dojo/text! plugin in a 'proper' dijit
        templateString: template,

        postCreate: function () {
            this.inherited(arguments);
        },

        detailsState: "default",
        _onPropertiesExpand: function (evt) {
            event.stop(evt);
            if (this.detailsState == "default") {
                domStyle.set(this.fieldsetProperties, "width", "90%");
                domStyle.set(this.fieldsetContent, "display", "none");
                this.set("detailsState", "propertiesMax");
            }
        },
        _onPropertiesContract: function (evt) {
            event.stop(evt);
            if (this.detailsState == "propertiesMax") {
                domStyle.set(this.fieldsetProperties, "width", "30%");
                domStyle.set(this.fieldsetContent, "display", "block");
                this.set("detailsState", "default");
            } else if (this.detailsState == "default") {
                domStyle.set(this.fieldsetProperties, "display", "none");
                domStyle.set(this.fieldsetContent, "width", "90%");
                this.set("detailsState", "propertiesMin");
            } else if (this.detailsState == "propertiesMin") {
                domStyle.set(this.fieldsetContent, "width", "60%");
                domStyle.set(this.fieldsetProperties, "width", "30%");
                domStyle.set(this.fieldsetContent, "display", "block");
                this.set("detailsState", "default");
            }
        },

        _onContentExpand: function (evt) {
            event.stop(evt);
            if (this.detailsState == "default") {
                domStyle.set(this.fieldsetContent, "width", "90%");
                domStyle.set(this.fieldsetProperties, "display", "none");
                this.set("detailsState", "propertiesMax");
            }
        },

        _onContentContract: function (evt) {
            event.stop(evt);
            if (this.detailsState == "propertiesMax") {
                domStyle.set(this.fieldsetContent, "width", "60%");
                domStyle.set(this.fieldsetProperties, "display", "block");
                this.set("detailsState", "default");
            } else if (this.detailsState == "default") {
                domStyle.set(this.fieldsetContent, "display", "none");
                domStyle.set(this.fieldsetProperties, "width", "90%");
                this.set("detailsState", "propertiesMin");
            } else if (this.detailsState == "propertiesMin") {
                domStyle.set(this.fieldsetContent, "width", "60%");
                domStyle.set(this.fieldsetProperties, "width", "30%");
                domStyle.set(this.fieldsetProperties, "display", "block");
                this.set("detailsState", "default");
            }
        }



    });

});