define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/BundleDetailsWidget.html",
    "dojo/request",
    "esb-console/utils/http"





], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template, request, http) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // Note: string would come from dojo/text! plugin in a 'proper' dijit
        templateString: template,

        postCreate: function () {
            this.inherited(arguments);

            var widget = this;


            request("services/environments/" + this.env + "/bundles/" + this.server + "/" + this.bundleId, {handleAs: "json"}).then(
                function (data) {
                    widget.set("routes", data.routes);
                    widget.renderred.callback();

                },
                function (error) {
                    widget.contentNode.innerHTML = "Error :" + error;
                    http.handleError(error);
                    widget.renderred.callback();
                }
            );
        },

        _onRefreshClick: function () {
            var widget = this;

            dojo.fadeOut({"node": widget.subContentNode}).play();
            request("services/environments/" + this.env + "/bundles/" + this.server + "/" + this.bundleId, {handleAs: "json"}).then(
                function (data) {
                    widget.set("routes", data.routes);
                    dojo.fadeIn({"node": widget.subContentNode}).play();

                },
                function (error) {
                    widget.contentNode.innerHTML = "Error :" + error;
                    dojo.fadeIn({"node": widget.subContentNode}).play();
                    http.handleError(error);
                }
            );
        }


    });

});