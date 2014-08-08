define(["dijit/Dialog"], function(Dialog){
    var service = {};
    service.handleError = function(error) {
        var dlgTitle = "Error "+  error.response.status;
        var dlgContent = "";
        if(error.response.status == 403) {
            if(error.response.text == null) {
                dlgContent = "Operation not permitted.";
            } else {
                dlgContent = error.response.text;
            }

        } else if(error.response.text != null) {
            dlgContent+=error.response.text;
        }
        else if(error.message != null) {
            dlgContent+= error.message;
        } else {
            dlgContent = "An unexpected application exception has occurred";
        }
        var errorDialog = new Dialog({
            title:  dlgTitle,
            content: dlgContent,
            style: "width: 300px"
        });
        errorDialog.show();

    };
    return service;

});