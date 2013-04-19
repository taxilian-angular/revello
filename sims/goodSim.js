var _ = require('underscore');
var mc = require('./mc');
var positions = require('./positions');
var minMaxFactory = require('./minMaxFactory');
var patterns = require('./patterns');

function invertPlayer(p) { return (p===1)?2:1; }
function invertStr(s) { return s.replace('1','3').replace('2','1').replace('3','2'); }

function matchHeuristic(board, player) {
    var score=0;

    _.each(board.getCorners(), function(corner) {
        var cornerInv;
        if(player!=1) {
            cornerInv=corner;
            corner=invertStr(corner);
        } else {
            cornerInv=invertStr(corner);
        }
        _.each(patterns, function(pat) {
            if(pat.type=='corner' && corner.match(pat.pattern)) {
                score+=pat.value;
            }
            if(pat.type=='corner' && cornerInv.match(pat.pattern)) {
                score-=pat.value;
            }
        });
    });

    _.each(board.getEdges(), function(edge) {
        var edgeInv;
        if(player!=1) { 
            edgeInv=edge;
            edge=invertStr(edge); 
        } else {
            edgeInv=invertStr(edge);
        }
        _.each(patterns, function(pat) {
            if(pat.type=='edge' && edge.match(pat.pattern)) {
                score+=pat.value;
            }
            if(pat.type=='edge' && edgeInv.match(pat.pattern)) {
                score-=pat.value;
            }
        });
    });


    return score;

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

var scoreHeuristic = function(board,player) {
    return board.getPlayerScore(player);
}

var matchStrategy = minMaxFactory(matchHeuristic, 2, 2, 1, 0.1);
var stableStrategy = minMaxFactory(stableScore, 2, 2, 1, 0.0);
var perfectStrategy = minMaxFactory(scoreHeuristic, 10, 10, 0.5, 0.0);

module.exports = function(board, player) {
    var remaining = board.getRemaining();

    if(remaining<=10) {
        return perfectStrategy(board, player);
    }

    return matchStrategy(board, player);
};

