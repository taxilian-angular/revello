var _ = require('underscore');
var mc = require('./mc');
var positions = require('./positions');

var sims = 1000;

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

function simulateGames(startBoard, firstPos, startPlayer, cnt) {
    var otherPlayer = invertPlayer(startPlayer);
    var winCnt = { startPlayer: 0, otherPlayer: 0 };
    var score;
    var board = startBoard.clone();
    board.playMove(firstPos, startPlayer);
    var otherPlayerMoves = board.getValidMoves(otherPlayer);
    var penaltyFactor=1;
    if(_.filter(otherPlayerMoves, positions.isCorner).length) {
        penaltyFactor=0.5;
    }

    for (var i=0;i<cnt;i++) {
        score=simulateGame(startBoard, otherPlayer); // fixme isn't this supposed to be board, not startBoard
        if(startPlayer==1) {
            if(score.black > score.white) { winCnt.startPlayer++; }
            else { winCnt.otherPlayer++; }
        } else {
            if(score.black > score.white) { winCnt.otherPlayer++; }
            else { winCnt.startPlayer++; }
        }

    }

    return penaltyFactor * winCnt.startPlayer / (winCnt.startPlayer + winCnt.otherPlayer);
}



module.exports = function(board, player) {
    var possibleMoves = board.getValidMoves(player);
    if(possibleMoves.length==0) { return null; }

    var cornerMoves = _.filter(possibleMoves, positions.isCorner);
    if(cornerMoves.length>0) {
        console.log("Found corner");
        return mc(cornerMoves);
    }

    var options = [];

    var score = board.getScore();
    var fullR = (score.black + score.white) / 64;

    // Loop through all possible moves
    _.each(possibleMoves, function(pos) {
        var winP = simulateGames(board, pos, player, sims);
        options.push({pos: pos, winP: winP});
        console.log("winP", winP);
    });

    return _.max(options, function(opt) { return opt.winP; }).pos;
};

