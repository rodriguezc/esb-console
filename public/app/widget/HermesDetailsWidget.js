define([
    "../../dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/hermesDetailsWidget.html",
    "dojo/request",
    "dojo/_base/array",
    "dojo/topic",
    "dijit/MenuBar",
    "dijit/DropDownMenu",
    "dijit/PopupMenuBarItem",
    "dijit/MenuItem",
    "dijit/PopupMenuItem",
    "dijit/layout/ContentPane",
    "dojo/hash"



], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template, request, array, topic, MenuBar, DropDownMenu, PopupMenuBarItem, MenuItem, PopupMenuItem, ContentPane) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        size: -1,
        dequeue: -1,
        enqueue: -1,
        inflight: -1,
        averageEnqueueTime: -1,
        // Note: string would come from dojo/text! plugin in a 'proper' dijit
        templateString: template,
        postCreate: function () {
            // Get a DOM node reference for the root of our widget
            var domNode = this.domNode;
            // Run any parent postCreate processes - can be done at any point
            this.inherited(arguments);
            console.log(this.size);

        },
        resize: function() {
            //  this.inherited(arguments);
            //   this.containerNode.resize();      //WORKAROUND
        }
    });

});