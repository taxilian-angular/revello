var _ = require('underscore');
var mc = require('./mc');
var positions = require('./positions');

var maxIter = 2;
var sims = 10;

function invertPlayer(p) { return (p===1)?2:1; }


function posWeight(pos) {
    if(positions.isCorner(pos)) { return 1000; }
    if(positions.isCornerOrAdjacent(pos)) { return 0.5; }
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


function simulateGame(startBoard, startPlayer) {
    var sPass=false, oPass=false;
    var otherPlayer = invertPlayer(startPlayer);
    var board = startBoard.clone();
    while(1) {
        sPass = playRandom(board, startPlayer)?false:true;
        oPass = playRandom(board, otherPlayer)?false:true;
        if(sPass && oPass) { break; }
    }

    return board.getScore();
}


function simulateGames(startBoard, startPlayer, cnt) {
    var otherPlayer = invertPlayer(startPlayer);
    var winCnt = { startPlayer: 0, otherPlayer: 0 };
    var score;

    for (var i=0;i<cnt;i++) {
        score=simulateGame(startBoard, startPlayer);
        if(startPlayer==1) {
            if(score.black > score.white) { winCnt.startPlayer++; }
            else { winCnt.otherPlayer++; }
        } else {
            if(score.black > score.white) { winCnt.otherPlayer++; }
            else { winCnt.startPlayer++; }
        }

    }

    return winCnt.startPlayer / (winCnt.startPlayer + winCnt.otherPlayer);
}


// Probability of startPlayer winning with startBoard
function playRound(startBoard, startPlayer, iter) {
    if(iter==maxIter) {
        // Maximum search depth -- play random games
        var ret= simulateGames(startBoard, startPlayer, sims);
//        console.log("sim", ret);
        return ret;
    }
    var moves = startBoard.getValidMoves(startPlayer);
    var otherPlayer = invertPlayer(startPlayer);
    var oppWinFraction = _.min(_.map(moves, function(pos) {
        var board = startBoard.clone();
        board.playMove(pos, startPlayer);
        var winP = playRound(board, otherPlayer, iter+1);
        return winP;
    }));
//    console.log("oppWinFraction", iter, oppWinFraction);
    return 1.0 - oppWinFraction;
}




module.exports = function(board, player) {
    var otherPlayer = invertPlayer(player);
    var possibleMoves = board.getValidMoves(player);
    if(possibleMoves.length==0) { return null; }

    var cornerMoves = _.filter(possibleMoves, positions.isCorner);
    if(cornerMoves.length>0) {
        return mc(cornerMoves);
    }

    var options = [];

    var score = board.getScore();
    var fullR = (score.black + score.white) / 64;

    // Loop through all possible moves
    _.each(possibleMoves, function(pos) {
        var board1 = board.clone();
        board1.playMove(pos, player);
        var winP = 1.0 - playRound(board1, otherPlayer, 0);
        var oppHasCornerOpt = _.filter(board1.getValidMoves(otherPlayer), positions.isCorner).length>0;
        if(oppHasCornerOpt) { winP*=0.5; }
        options.push({pos: pos, winP: winP});
    });

    return _.max(options, function(opt) { return opt.winP; }).pos;
};

