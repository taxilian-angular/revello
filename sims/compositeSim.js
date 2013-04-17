var _ = require('underscore');
var mc = require('./mc');
var treeMcSim = require('./treeMcSim');
var simpleSim = require('./simpleSim');
var randomSim = require('./randomSim');
var positions = require('./positions');


module.exports = function(board, player) {
    var score = board.getScore();
    var fullR = (score.black + score.white) / 64;

    if(fullR<0.7) { // First part of the game we play with simpleSim
        return simpleSim(board, player);
    } else {
        return treeMcSim(board, player);
    }
};

