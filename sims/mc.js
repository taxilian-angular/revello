var _ = require('underscore');


module.exports = function monteCarlo(array, iterator) {
    if(!iterator) { iterator=function() { return 1; } }
    var weights = _.map(array, iterator);
    var tot = _.reduce(weights, function(memo, num){ return memo + num; }, 0)
    var i=0;
    // normalize weights to be probabilities
    for(i=0;i<weights.length;i++) { weights[i]/=tot; }
    
    while(true) {
        var ind = _.random(0, weights.length);
        var w = weights[ind];
        if(w > Math.random()) {
            return array[ind];
        }
    }
};

