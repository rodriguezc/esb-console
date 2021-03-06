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
                            if (changedHash.indexOf(item.navHash) != -1 && (    changedHash.charAt(item.navHash.length) == "&"
                                                                             || item.navHash.length == changedHash.length
                                                                           )
                              )   {
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

                            var cp1 = new ContentPane({
                                navHash: changedHash,
                                closable: true,
                                onClose: function () {
                                    //Closing the last widget
                                    if (widget.getChildren().length == 1) {
                                        hash(widget.baseHash);
                                    }
                                    return true;
                                },
                                addTabLoadingState: function () {
                                    this.set("title", "<img src='esb-console/images/ajax-loader.gif'/>" + cp1.title);
                                },

                                removeTabLoadingState: function () {
                                    cp1.set("title", cp1.origTitle);
                                }

                            });

                            var content = widget.generateTabContent(hashObj, cp1);

                            if (content != null) {

                                if(content.loadOnCreate == false) {
                                    cp1.set("origTitle", content.title);
                                    cp1.set("title", content.title);
                                } else {
                                    cp1.set("origTitle", content.title);
                                    cp1.set("title", cp1.get("title")+content.title);
                                }

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