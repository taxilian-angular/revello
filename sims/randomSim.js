var _ = require('underscore');
var mc = require('./mc');

module.exports = function(board, player) {
    var possibleMoves = board.getValidMoves(player);
    if(possibleMoves.length==0) { return null; }
    console.log("randomSim real smart");
    return mc(possibleMoves);
};

