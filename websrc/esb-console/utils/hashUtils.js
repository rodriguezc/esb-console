define(["dojo/hash","dojo/topic"], function(hash, topic){
    var service = {};
    service.changeHashParamByParam = function(startingHash) {
        for (var i = 0; i <  startingHash.length; i++) {
            var currentChar = startingHash[i];
            if(currentChar == "&") {
                var tempHash = startingHash.substring(0, i);
                hash(tempHash, true);
                topic.publish("/dojo/hashchange", tempHash);
            }
            else if(startingHash.length-1 == i) {
                hash(startingHash);
                topic.publish("/dojo/hashchange", startingHash);
            }
        }
    }
    return service;

});