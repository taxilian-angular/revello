var _ = require('underscore');
var mc = require('./mc');
var positions = require('./positions');
var minMaxFactory = require('./minMaxFactory');

function invertPlayer(p) { return (p===1)?2:1; }


function playRandom(board, player) {
    var possibleMoves = board.getValidMoves(player);
    var pos;
    if(possibleMoves.length==0) {
        pos=null; // Must pass
    } else {
        pos=mc(possibleMoves);
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

    return board;
}

function stableScore(board, player) {
    var sims=5;
    var boards = [];
    var i,j,x;
    var stable1=0, stable2=0;

    _.each(board.getValidMoves(player), function(pos) {
        var board1=board.clone();
        board1.playMove(pos,player);
        boards.push(board1.board);
        _.each(board1.getValidMoves(invertPlayer(player)), function(pos2) {
            var board2=board1.clone();
            board2.playMove(pos2, invertPlayer(player));
            boards.push(board2.board);
        });
    });

    for(j=0;j<64;j++) {
        x = board.board[j];
        if(x==0) { continue; }
        var stable=true;
        for(i=0; i<boards.length; i++) {
            if(boards[i][j] != x) {
                stable=false;
                break;
            }
        }
        if(stable && (x==1)) { stable1++; }
        else if(stable && (x==2)) { stable2++; }
    }

    if(player==1) { return stable1-stable2; } 
    else { return stable2-stable1;}

}



function simulateGames(startBoard, startPlayer, cnt) {
    var otherPlayer = invertPlayer(startPlayer);
    var winCnt=0;
    var b;

    for (var i=0;i<cnt;i++) {
        b=simulateGame(startBoard, startPlayer);
        if(b.getPlayerScore(startPlayer) > 32) { winCnt++; }
    }

    return winCnt / cnt;
}


function countCorners(board, player) {
    var tl = board.checkPos({r:0, c:0});
    var tr = board.checkPos({r:0, c:7});
    var bl = board.checkPos({r:7, c:0});
    var br = board.checkPos({r:7, c:7});
    var otherPlayer = invertPlayer(player);
    var cornerCnt =     (tl==player) - (tl==otherPlayer) +
                        (tr==player) - (tr==otherPlayer) +
                        (bl==player) - (bl==otherPlayer) +
                        (br==player) - (br==otherPlayer);

    var otherPlayerMoves = board.getValidMoves(otherPlayer);
    cornerCnt -= _.filter(otherPlayerMoves, positions.isCorner).length;

    return cornerCnt;
}


// Get the value of a board position for player, assuming he just played
function earlyHeurestic(board, player) {
    var cornerCnt = countCorners(board,player);
    var otherPlayer = invertPlayer(player);
    var otherPlayerMoves = board.getValidMoves(otherPlayer);
    
    var score = board.getScore();

    var rand = Math.random() * 100;

    var movesScore = 0;
    _.each(otherPlayerMoves, function(pos) {
        if(positions.isMiddle4x4(pos)) { movesScore-=2; }
        if(positions.isCornerAdjacent(pos)) { movesScore+=2; }
        movesScore--;
    });
        
    return cornerCnt*1000 + movesScore + rand;
 }

// Get the value of a board position for player, assuming he just played
function midHeurestic(board, player) {
    var cornerCnt = countCorners(board,player);
    
    var myscore = board.getPlayerScore(player);

    var rand = Math.random() * 5;

    return cornerCnt*1000 + myscore + rand;
}

function earlyLateHeurestic(board, player) {
    var cornerCnt = countCorners(board,player);
    
    var myscore = stableScore(board, player);
    var rand = Math.random() * 5;

    return cornerCnt*1000 + myscore*50 + rand;

//    return simulateGames(board, player, 4);
}

function lateLateHeurestic(board, player) {
    return simulateGames(board, player, 100);
}

var earlyGame = minMaxFactory(earlyHeurestic, 2, 2);
var midGame = minMaxFactory(midHeurestic, 4, 2);
var earlyLateGame = minMaxFactory(earlyLateHeurestic, 2,2);
var lateLateGame = minMaxFactory(lateLateHeurestic, 2,2);

module.exports = function(board, player) {
    var score = board.getScore();
    var remaining = 64 - score.black - score.white;

    console.dir(board.getEdges());
    if(remaining > 30) {
        console.log("earlyGame");
        return earlyGame(board, player);
  /*  } else if(remaining > 30) {
        console.log("midGame");
        return midGame(board, player); */
    }  else if(remaining > 10) {
        console.log("earlyLateGame");
        return earlyLateGame(board, player);
    } else {
        console.log("lateLateGame");
        return lateLateGame(board, player);
    }
}
