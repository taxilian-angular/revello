/*global angular,Firebase,_*/
angular.module('RevelloApp.controllers', []).
  controller('revelloController', ['$scope', 'boardService', function($scope, boardService) {
    var ref = new Firebase("https://revello.firebaseio-demo.com/");
    var gameBoard = new boardService.Board();
    var otherPlayer = function(player) {
        if(player==2) { return 1; }
        return 2;
    };
    $scope.data = { };
    $scope.offColorIdx = [];
    $scope.player = 1;
    $scope.won = false;
    for (var i = 0; i < 64; ++i) {
        var rowIdx = Math.floor(i / 8);
        $scope.offColorIdx[i] = ((rowIdx % 2) + (i % 2)) % 2;
    }
    function updateBoard() {
        var sqr = $scope.data.boardSquares = gameBoard.getSquares();
        var moves = gameBoard.getValidMoves($scope.player);
        _.each(moves, function(move) {
            var idx = move.r*8+move.c;
            sqr[idx] = 'O';
        });
        $scope.movesPossible = moves.length;
        $scope.p1Score = 0;
        $scope.p2Score = 0;
        for (var i = 0; i < sqr.length; ++i) {
            if (sqr[i] == 1) { $scope.p1Score++; }
            if (sqr[i] == 2) { $scope.p2Score++; }
        }
        // Test to see if the game is over
        if (moves.length === 0 && gameBoard.getValidMoves(otherPlayer($scope.player)).length === 0) {
            if ($scope.p1Score > $scope.p2Score) {
                $scope.won = "Player 1 won " + $scope.p1Score + " to " + $scope.p2Score + "!";
            } else if ($scope.p2Score > $scope.p1Score) {
                $scope.won = "Player 2 won " + $scope.p2Score + " to " + $scope.p1Score + "!";
            } else {
                $scope.won = "You tied, it's a draw! " + $scope.p2Score + " to " + $scope.p1Score + "!";
            }
        }
    }
    updateBoard();

    $scope.makeMove = function(idx) {
        if (idx === null) {
            // Pass the turn
            $scope.player = otherPlayer($scope.player);
        } else if ($scope.data.boardSquares[idx] != 'O') {
            // Not a valid move
            return;
        } else {
            var pos = {
                r: Math.floor(idx / 8),
                c: idx % 8
            };
            gameBoard.playMove(pos, $scope.player);
            $scope.player = otherPlayer($scope.player);
        }
        updateBoard();
    };

  }]);
