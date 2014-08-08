define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/BundlesWidget.html",
    "dojo/request",
    "dojo/_base/array",
    "dojo/topic",
    "dojo/hash",
    "gridx/Grid",
    "dojo/store/Memory",
    "esb-console/utils/http"

    ],
    function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template,
             request, array, topic, hash, Grid, Store, http) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        env: "DEFAULTENV",
        // Note: string would come from dojo/text! plugin in a 'proper' dijit
        templateString: template,
        postCreate: function() {
            this.inherited(arguments);
            var widget = this;

            request("/services/environments/"+this.env+"/bundles", {handleAs: "json"}).then(
                function(data){
                    var store = new Store({data: data});
                    widget.gridWidget.model.clearCache();
                    widget.gridWidget.model.setStore(store);
                    widget.gridWidget.body.refresh();
                    widget.gridWidget.column(0).sort(false);
                },
                function(error){
                    http.handleError(error);
                }
            );
        },

        resize: function () {
            this.inherited(arguments);
            this.gridWidget.resize();
        }

    });

});