var _ = require('underscore');
var mc = require('./mc');
function invertPlayer(p) { return (p===1)?2:1; }

function treeSearch(board, player, depth, iterator, positions) {
    var moves = board.getValidMoves(player);
    if(!positions) { positions=[]; }

    if(depth==0) {
        iterator(board, moves, player, positions);
        return;
    }

    _.each(moves, function(move) {
        var board1 = board.clone();
        board1.playMove(move, player);
        treeSearch(board1, invertPlayer(player), depth - 1, iterator, positions.concat([move]));
    });

}


module.exports = treeSearch;
