define(["dojo/_base/declare", "dijit/layout/TabContainer", "dojo/hash", "dojo/topic", "dojo/io-query",
        "dijit/layout/ContentPane", "dojo/_base/array"
    ],
    function (declare, TabContainer, hash, topic, ioQuery, ContentPane, array) {
        return declare(TabContainer, {


            postCreate: function () {
                this.inherited(arguments);

                //Store value of the hash when this tabContainer was created
                this.baseHash = hash();

                var widget = this;

                //Update hash when selected tab change
                this.watch("selectedChildWidget", function (name, oval, nval) {
                    hash(nval.navHash); //Take hash of the contentPane
                });
                //Watch hash change
                this.hashChangeHandle = topic.subscribe("/dojo/hashchange", function (changedHash) {
                    //is part of the new hash same as when this widget was created
                    var sameBaseHash = changedHash.indexOf(widget.baseHash) != -1;
                    if (sameBaseHash & changedHash.length > widget.baseHash.length) {
                        var found = false;

                        array.forEach(widget.getChildren(), function (item, index) {
                            //C'est la même ligne
                            if (changedHash.indexOf(item.navHash) != -1) {
                                found = true;
                                //!already selected?
                                if (item != widget.selectedChildWidget) {
                                    widget.selectChild(item);  //Sélection du tab déjà ouvert
                                    item.resize();
                                }
                            }
                        });


                        if (!found) {
                            var hashObj = ioQuery.queryToObject(changedHash);
                            var content = widget.generateTabContent(hashObj);

                            if (content != null) {
                                var cp1 = new ContentPane({
                                    navHash: changedHash,
                                    title: content.title,
                                    closable: true,
                                    onClose: function () {
                                        //Closing the last widget
                                        if (widget.getChildren().length == 1) {
                                            hash(widget.baseHash);
                                        }
                                        return true;
                                    }
                                });
                                //TODO: Cause error on IE8
                                widget.addChild(cp1);
                                content.widget.placeAt(cp1);
                                widget.selectChild(cp1);  //Sélection du tab déjà ouvert
                            }
                        }
                    }

                });
            },
            destroy: function () {
                this.inherited(arguments);
                this.hashChangeHandle.remove();
            }
        });
    });