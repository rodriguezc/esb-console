define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/QueuesStatsWidget.html",
    "dojo/request",
    "dojo/_base/array",
    "dojo/topic",
    "dojo/hash",
    "gridx/Grid",
    "dojo/store/Memory",
    "gridx/core/model/cache/Sync",
    "gridx/modules/Filter",
    "gridx/modules/SingleSort",
    "gridx/modules/filter/QuickFilter",
    "gridx/modules/VirtualVScroller",
    "gridx/modules/GroupHeader",
    "esb-console/utils/hashUtils"

], function (declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, template,
             request, array, topic, hash, Grid, Store, Cache, Filter, Sort, QuickFilter, VirtualVScroller,GroupHeader, hashUtils) {
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        env: "DEFAULTENV",

        // Note: string would come from dojo/text! plugin in a 'proper' dijit
        templateString: template,
        postCreate: function() {
            this.inherited(arguments);
            var widget = this;

            request("/services/environments/"+this.env+"/queuesstats", {handleAs: "json"}).then(
                function(data){
                    var store = new Store({data: data});
                    var structure =  [
                                            {field: 'name', name: 'name'},
                                            {field: 'size', name: 'size'}
                    ];


                    var existingBrokersId  = [];
                    var existingBrokersName  = [];

                    array.forEach(data, function (item, index) {
                            array.forEach(item.brokers, function (broker, brokerIdIndex) {

                                item[broker.id+"_size"] =  broker.stats.size;
                                item[broker.id+"_consumers"] =  broker.stats.consumersSize;
                                item[broker.id+"_dequeue"] =  broker.stats.dequeue;

                                if(array.indexOf(existingBrokersId, broker.id) == -1) {
                                   existingBrokersId.push(broker.id);
                                   existingBrokersName.push(broker.name);
                               }
                            });
                    });

                    var headerGroups = [
                        {name: 'Global', children: 2}
                    ];

                    for(var i = 0; i < existingBrokersId.length; i++) {
                        headerGroups.push({name: existingBrokersName[i], children: 3});
                        structure.push({field: existingBrokersId[i]+'_size', name: 'size', brokerId: existingBrokersId[i]});
                        structure.push({field: existingBrokersId[i]+'_consumers', name: 'consumers', brokerId: existingBrokersId[i]});
                        structure.push({field: existingBrokersId[i]+'_dequeue', name: 'dequeue', brokerId: existingBrokersId[i]});
                    }

                    structure.push({field: "status", name: "status (OK,KO,WARN)"});

                    var grid = new Grid({
                        cacheClass: Cache,
                        modules: [
                            Sort,
                            Filter,
                            QuickFilter,
                            VirtualVScroller,
                            GroupHeader
                        ],
                        store: store,
                        structure: structure,
                        headerGroups: headerGroups
                    });

                    widget.gridWidget = grid;


                    grid.onCellClick = function(evt) {

                        //Double click
                        if(evt.detail == 2) {
                            var cell = grid.cell(evt.rowId, evt.columnId);
                            var posColumn = cell.column.id;

                            var line = cell.row.model.byId(cell.row.id).item;
                            var queueName = line.name;

                            //Click over Global column or //Click over last column
                            if(posColumn < 3 || posColumn == structure.length) {
                                array.forEach(line.brokers, function (broker, index) {
                                    hashUtils.changeHashParamByParam("env="+widget.env+"&page=jmsBrowser&broker="+broker.id+"&queue="+queueName);
                                });
                            }
                            //Click over a broker column
                            else {
                                console.log("broker column");
                                var brokerId = structure[posColumn-1].brokerId;
                                hashUtils.changeHashParamByParam("env="+widget.env+"&page=jmsBrowser&broker="+brokerId+"&queue="+queueName);
                            }
                        }
                    }
                    grid.placeAt(widget.gridNode);
                    grid.startup();
                },
                function(error){
                    alert("error");
                }

            );

        },

        resize: function () {
            this.inherited(arguments);
            if(this.gridWidget != undefined) {
                this.gridWidget.resize();
            }
        }

    });

});