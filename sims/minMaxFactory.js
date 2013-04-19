var _ = require('underscore');
var mc = require('./mc');
var positions = require('./positions');

function invertPlayer(p) { return (p===1)?2:1; }


// Get the value of a board for player after just playing
// returns {worstCase: worstCaseValue, avgCase: avgCaseValue}
//
function getBoardValue(board, player, heuristic, depth, fulldepth, mixValue) {
    if(depth==0 || (board.getRemaining()==0)) {
        var val= heuristic(board, player);
        return {worstCase: val, avgCase: val};
    }

    var posMoves = board.getValidMoves(invertPlayer(player));
    if(posMoves.length==0) { posMoves.push(null);  /* Pass is the only option */ }


    if((fulldepth <= 0) && posMoves.length>2) {
        // we're past the full depth.  Search only the two branches with the largest heuristic
        
        var options = [];
        
        _.each(posMoves, function(pos) {
            var board1 = board.clone();
            board1.playMove(pos, invertPlayer(player));
            pos.value = heuristic(board1, invertPlayer(player));
            options.push(pos);
        });

        posMoves = _.sortBy(options, function(opt) { return -1.0*opt.value; }).slice(0,2);
    }

    var moveVals =_.map(posMoves, function(pos) {
        var board1 = board.clone();
        board1.playMove(pos, invertPlayer(player));
        var val=getBoardValue(board1, invertPlayer(player), heuristic, depth-1, fulldepth-1, mixValue);
        return val;
    });

    var simpleVal = heuristic(board,player);

    var worstVal = -1.0 * _.max(moveVals, function(val) { return val?val.worstCase:0; }).worstCase;
    var sumVal = 0, avgVal=0;
    if(moveVals.length) {
        _.each(moveVals, function(v) { sumVal+=v?v.avgCase:0; });
        avgVal = -1.0 * sumVal / moveVals.length;
    }
    return {worstCase: (1.0-mixValue)*worstVal + mixValue*simpleVal, avgCase: 0.9*avgVal + 0.1*simpleVal};
    
//    console.log("finalVal=", finalVal);
//    return finalVal;
}

module.exports = function(heuristic, depth, fulldepth, oppStrength, mixValue) {
    if(!oppStrength) { oppStrength=1;}
    if(!mixValue) { mixValue=0; }
    return function(board, player) {
        var possibleMoves = board.getValidMoves(player);
        if(possibleMoves.length==0) { return null; }
        

        var cornerMoves = _.filter(possibleMoves, positions.isCorner);
        if(cornerMoves.length>0) {
            return mc(cornerMoves);
        }

        var options = [];
        
        _.each(possibleMoves, function(pos) {
            var board1 = board.clone();
            board1.playMove(pos, player);
            var value = getBoardValue(board1, player, heuristic, depth, fulldepth, mixValue);
            options.push({pos:pos, value:value?(oppStrength*value.worstCase + (1.0-oppStrength)*value.avgCase):0});
        });

        console.log("Options:", options);
        return _.max(_.shuffle(options), function(opt) { return opt.value; }).pos;
        
    }

};

