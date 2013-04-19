var _ = require('underscore');
var mc = require('./mc');
var positions = require('./positions');
var minMaxFactory = require('./minMaxFactory');
var patterns = require('./patterns');
var mcSim = require('./treeMcSim');

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


var scoreHeuristic = function(board,player) {
    return board.getPlayerScore(player);
}

var matchStrategy = minMaxFactory(matchHeuristic, 4, 2, 1, 0.1);
var perfectStrategy = minMaxFactory(scoreHeuristic, 10, 10, 0.6, 0.0);

module.exports = function(board, player) {
    var remaining = board.getRemaining();

    if(remaining<=10) {
        return perfectStrategy(board, player);
    } else if(remaining<20) {
        return mcSim(board, player);
    }

    return matchStrategy(board, player);
};

