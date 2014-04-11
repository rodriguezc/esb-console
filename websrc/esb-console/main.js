require([
    "dojo/parser",
    "esb-console/widget/IndexWidget",
    "dojo/hash",
    "esb-console/utils/hashUtils",
    "dojo/domReady!"
], function (parser, IndexWidget, hash,hashUtils) {
    parser.parse();
    var startingHash = hash();

    if(startingHash) {
        hash("", true); //very important: before creating IndexWidget else IndexWidget is not initialized with the good hash
    }

    var indexWidget = new IndexWidget();
    indexWidget.placeAt("bodyContent");

    //if there is an hash -> invoke hashchange to open page
    if(startingHash) {
        hashUtils.changeHashParamByParam(startingHash);
    }
});