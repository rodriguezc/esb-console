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
    "esb-console/utils/http",
    "esb-console/widget/BundleDetailsWidget"


    ],
    function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template,
             request, array, topic, hash, Grid, Store, http, BundleDetailsWidget) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        env: "DEFAULTENV",
        // Note: string would come from dojo/text! plugin in a 'proper' dijit
        templateString: template,
        postCreate: function() {
            this.inherited(arguments);
            var widget = this;

            widget.gridWidget.bundlesWidget = this;

            widget.haContentPane.addTabLoadingState();

            request("services/environments/"+this.env+"/bundles", {handleAs: "json"}).then(
                function(data){
                    var store = new Store({data: data});
                    widget.gridWidget.model.clearCache();
                    widget.gridWidget.model.setStore(store);
                    widget.gridWidget.body.refresh();
                    widget.gridWidget.column(0).sort(false);
                    widget.haContentPane.removeTabLoadingState();
                },
                function(error){
                    widget.haContentPane.removeTabLoadingState();
                    http.handleError(error);
                }
            );
        },

        detailProvider: function (grid, rowId, detailNode, renderred) {
            console.log(this);
            var rowData = grid.model.byId(rowId).item;
            console.log(rowData);
            var bundleDetailsWidget = new BundleDetailsWidget(
                {
                    "env" : grid.bundlesWidget.env,
                    "server" : rowData.serverName,
                    "bundleId" : rowData.bundleId,
                    "renderred" : renderred

        }
            );
            bundleDetailsWidget.placeAt(detailNode);
            bundleDetailsWidget.startup();
            return renderred;

        },

        resize: function () {
            this.inherited(arguments);
            this.gridWidget.resize();
        }

    });

});