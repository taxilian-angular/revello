
var _ = require('underscore');
var Board = require('board');
var sim = require('sims/randomSim');
var mcSim = require('sims/mcSim');
var treeMcSim = require('sims/treeMcSim');
var simpleSim = require('sims/simpleSim');
var compositeSim = require('sims/compositeSim');
var human = require('human');

var Deferred = require('deferred');

console.log("Othello Game");
//console.log("Would you like black or white (b/w)?");

//var human, computer;
var board = new Board();
var players = {
    1: compositeSim,
    2: human
};

var currentPlayer;
var round = 0;

function playRound() {
    round++;
    
    if(currentPlayer==1) { currentPlayer=2; }
    else { currentPlayer=1; }

    console.log("Round " + round + ".  " + ["","Black","White"][currentPlayer] + " plays next.");

    if(round===61) {
        console.log("Game over!");
        var score = board.getScore();
        console.log("Final score: Black " + score.black + " -- White " + score.white);
        board.print();
        return;
    }


    var player = players[currentPlayer];
    var posDfd = player(board, currentPlayer);
    Deferred.when(posDfd).done(function(pos) {
        if(pos) { // pos == null indicates a pass
            board.playMove(pos, currentPlayer);
        }  else {
            console.log("Pass");
        }
        playRound();
    });

}

playRound();


