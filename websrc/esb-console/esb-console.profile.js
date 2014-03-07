var profile = (function(){
    var testResourceRe = /^dijit\/tests\//,

        copyOnly = function(filename, mid){
            var list = {
                "esb-console/esb-console.profile":1,
                "esb-console/package.json":1
            };
            return (mid in list) || /(css|png|jpg|jpeg|gif|tiff)$/.test(filename);
        };

    return {
        resourceTags:{
            copyOnly: function(filename, mid){
                return copyOnly(filename, mid);
            },

            amd: function(filename, mid){
                return !copyOnly(filename, mid) && /\.js$/.test(filename);
            }
        }
    };
})();


