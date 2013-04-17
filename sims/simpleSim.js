var _ = require('underscore');
var mc = require('./mc');
var positions = require('./positions');


function invertPlayer(p) { return (p===1)?2:1; }


function posWeight(pos) {
    if(positions.isCorner(pos)) { return 1000; }
    if(positions.isCornerOrAdjacent(pos)) { return 0.1; }
    if(positions.isMiddle4x4(pos)) { return 3; }
    return 1;
}


function playRandom(board, player) {
    var possibleMoves = board.getValidMoves(player);
    var pos;
    if(possibleMoves.length==0) {
        pos=null; // Must pass
    } else {
        pos=mc(possibleMoves, posWeight);
        board.playMove(pos, player);
    }
    return pos;
}


function movesScore(moves) {
    var score=0;
    score += 1000 * _.filter(moves, positions.isCorner).length;
    score -= 2 * _.filter(moves, positions.isCornerAdjacent).length;
    score += 2 * _.filter(moves, positions.isMiddle4x4).length;
    score += 1 * moves.length;

    return score;
}

module.exports = function(board, player) {
    var otherPlayer = invertPlayer(player);
    var possibleMoves = board.getValidMoves(player);
    if(possibleMoves.length==0) { return null; }

    var cornerMoves = _.filter(possibleMoves, positions.isCorner);
    if(cornerMoves.length>0) {
        console.log("Found corner");
        return mc(cornerMoves);
    }

    // No corner moves found

    var best = _.max(possibleMoves, function(pos1) {
        var board1 = board.clone();
        board1.playMove(pos1, player);
        
        var counterMoves = board1.getValidMoves(otherPlayer);
        if(counterMoves.length===0) { return 10000; }
        var worstCounterCounterScore = _.min(_.map(counterMoves, function(pos2) {
            var board2 = board1.clone();
            board2.playMove(pos2, otherPlayer);
            var counterCounterMoves = board2.getValidMoves(player);
            return movesScore(counterCounterMoves);
        }));

        return worstCounterCounterScore - movesScore(counterMoves);
    });

    return best;
};

