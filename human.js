var readline = require('readline');
var Deferred = require('deferred');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function getHumanMove(board, humanPlayer) {
    console.log();
    console.log("Current Board");
    board.printWithMoves(humanPlayer);

    var ret = new Deferred();
    rl.question('Move: ', function(cmd) {
        var moves = board.getValidMoves(humanPlayer);
        if(moves.length===0) {
            console.log("Pass!");
            ret.resolve(null);
        } else if(moves[Number(cmd)]) {
            ret.resolve(moves[Number(cmd)]);
        } else {
            getHumanMove(board, humanPlayer).done(function(res) { ret.resolve(res); });
        }
    });
    return ret;
}

module.exports = getHumanMove;



