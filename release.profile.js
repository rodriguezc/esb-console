var profile = (function () {
    return {
        basePath: "websrc",
        releaseDir: "release",
        releaseName: "release",
        action: "release",
        layerOptimize: "shrinksafe.keeplines", //shrinksafe tout court crée des problèmes
        stripConsole: "warn", //Enlever les console.log...
        cssOptimize: "comments",


        packages: [
            {
                name: "dojo",
                location: "dojo"
            },
            {
                name: "dijit",
                location: "dijit"
            },
            {
                name: "dojox",
                location: "dojox"
            },
            {
                name: "gridx",
                location: "gridx"
            },
            {
                name: "esb-console",
                location: "esb-console"
            }
        ],


        layers: {
            "layouts/all": {
                include: [
                    "esb-console/widget/AuditWidget",
                    "esb-console/widget/BundleDetailsWidget",
                    "esb-console/widget/BundlesWidget",
                    "esb-console/widget/DashboardWidget",
                    "esb-console/widget/DetailsWidget",
                    "esb-console/widget/IndexWidget",
                    "esb-console/widget/JmsBrowserWidget",
                    "esb-console/widget/MessageDetailsWidget",
                    "esb-console/widget/QueueDetailsWidget",
                    "esb-console/widget/QueuesStatsWidget",
                    "esb-console/layout/HashAwareTabContainer",
                    "esb-console/utils/hashUtils",
                    "esb-console/utils/http",
                    "esb-console/main",
                    "dojo/fx",
                    "dojo/dojo",
                    "dojo/selector/acme",
                    "dijit/form/nls/fr/validate",
                    "gridx/nls/fr/gridx",
                    "dijit/nls/fr/loading",
                    "dojox/form/nls/Uploader",
                    "dojox/form/nls/fr/Uploader",
                    "dijit/form/nls/fr/ComboBox",
                    "dijit/nls/loading",
                    "dijit/nls/fr/common",
                    "dijit/nls/loading",
                    "dojox/mvc/at",
                    "dojox/mvc/sync",
                    "dojox/mvc/_atBindingExtension",
                    "dojox/mvc/_atBindingMixin",
                    "dojox/mvc/resolve",
                    "dojo/_base/declare",
                    "dojo/parser",
                    "dojo/topic",
                    "dojo/hash",
                    "dojo/io-query",
                    "dojo/domReady",
                    "dijit/_WidgetBase",
                    "dijit/_OnDijitClickMixin",
                    "dijit/_TemplatedMixin",
                    "dijit/_WidgetsInTemplateMixin",
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
                    "dojo/dom-style",
                    "dijit/_WidgetBase",
                    "dijit/_OnDijitClickMixin",
                    "dijit/_TemplatedMixin",
                    "dijit/_WidgetsInTemplateMixin",
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
                    "dijit/_WidgetBase",
                    "dijit/_OnDijitClickMixin",
                    "dijit/_TemplatedMixin",
                    "dijit/_WidgetsInTemplateMixin",
                    "dojo/request",
                    "dijit/Dialog",
                    "dojo/_base/array",
                    "dojo/store/Memory",
                    "dojox/html/entities",
                    "dojo/topic","dojo/dom-style",
                    "dojo/dom-form",
                    "dijit/layout/BorderContainer",
                    "dijit/layout/ContentPane",
                    "dojox/mvc/Output",
                    "dijit/form/Button",
                    "dijit/layout/TabContainer",
                    "dijit/Dialog",
                    "dojox/form/Uploader",
                    "dojox/form/uploader/FileList",
                    "dojox/mvc/Repeat",
                    "dijit/form/FilteringSelect",
                    "dijit/form/ComboBox",
                    "dijit/form/Textarea",

                    "dijit/form/Form",
                    "dijit/form/Select",
                    "dijit/form/_FormSelectWidget",
                    "dijit/MenuSeparator",
                    "dojo/data/util/sorter",

                    "gridx/Grid",
                    "gridx/modules/Filter",
                    "gridx/core/model/extensions/ClientFilter",
                    "gridx/modules/SingleSort",
                    "gridx/core/model/extensions/Sort",
                    "gridx/modules/filter/QuickFilter",
                    "dojox/gesture/tap",
                    "gridx/support/QuickFilter",
                    "gridx/modules/Puller",
                    "gridx/modules/Bar",
                    "dijit/form/ComboButton",
                    "dijit/form/DropDownButton",
                    "dojox/gesture/Base",
                    "gridx/modules/VirtualVScroller",
                    "gridx/modules/IndirectSelect",
                    "gridx/modules/Menu",
                    "gridx/modules/RowHeader",
                    "gridx/modules/extendedSelect/Row",
                    "gridx/modules/extendedSelect/_RowCellBase",
                    "gridx/modules/extendedSelect/_Base",
                    "gridx/core/model/extensions/Mark",
                    "gridx/modules/AutoScroll",
                    "gridx/modules/Dod",
                    "dojo/store/JsonRest",
                    "dojo/data/ObjectStore",
                    "dojo/date/locale"


                ],
                customBase: true
            }
        }
    };
})();