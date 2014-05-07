/*global angular*/
angular.module('RevelloApp.controllers', []).
  controller('revelloController', ['$scope', 'boardService', function($scope, boardService) {
    var gameBoard = new boardService.Board();
    var otherPlayer = function(player) {
        if(player==2) { return 1; }
        return 2;
    };
    $scope.data = { };
    $scope.offColorIdx = [];
    $scope.player = 1;
    for (var i = 0; i < 64; ++i) {
        var rowIdx = Math.floor(i / 8);
        $scope.offColorIdx[i] = ((rowIdx % 2) + (i % 2)) % 2;
    }
    function updateBoard() {
        $scope.data.boardSquares = gameBoard.getSquares();
        var moves = gameBoard.getValidMoves($scope.player);
        _.each(moves, function(move) {
            var idx = move.r*8+move.c;
            $scope.data.boardSquares[idx] = 'O';
        });
    }
    updateBoard();

    $scope.makeMove = function(idx) {
        if ($scope.data.boardSquares[idx] != 'O') {
            // Not a valid move
            return;
        } else {
            var pos = {
                r: Math.floor(idx / 8),
                c: idx % 8
            };
            gameBoard.playMove(pos, $scope.player);
            $scope.player = otherPlayer($scope.player);
            updateBoard();
        }
    };
  }]);
