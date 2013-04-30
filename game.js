
var _ = require('underscore');
var Board = require('board');
var randomSim = require('sims/randomSim');
var mcSim = require('sims/mcSim');
var treeMcSim = require('sims/treeMcSim');
var simpleSim = require('sims/simpleSim');
var goodSim = require('sims/goodSim');
var goodSim2 = require('sims/goodSim2');
var compositeSim = require('sims/compositeSim');
var minMaxSim = require('sims/minMax');

var human = require('human');

var Deferred = require('deferred');

console.log("Othello Game");
//console.log("Would you like black or white (b/w)?");

//var human, computer;
var board = new Board();
var players = {
    1: goodSim2, //compositeSim,
    2: human //goodSim2 // human //goodSim2 //randomSim //human // treeMcSim //simpleSim
};

var currentPlayer;
var round = 0;

var lastPass = false;

function playRound() {
    round++;

    if(currentPlayer==1) { currentPlayer=2; }
    else { currentPlayer=1; }

    console.log("Round " + round + ".  " + ["","Black","White"][currentPlayer] + " plays next.");
    var score = board.getScore();
    console.log("Current Score: Black " + score.black + " -- White " + score.white);
    board.printWithMoves();

    var player = players[currentPlayer];
    var posDfd = player(board, currentPlayer);
    Deferred.when(posDfd).done(function(pos) {
        if(pos) { // pos == null indicates a pass
            board.playMove(pos, currentPlayer);
            console.log("Played Move", pos);
            lastPass=false;
        }  else {
            if(lastPass) {
                console.log("Game over!");
                var score = board.getScore();
                console.log("Final score: Black " + score.black + " -- White " + score.white);
                board.print();
                return;
            }
            lastPass = true;
            console.log("Pass");
        }
        playRound();
    });

}

playRound();


