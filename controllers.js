/*global angular*/
angular.module('RevelloApp.controllers', []).
  controller('revelloController', ['$scope', 'boardService', function($scope, boardService) {
    var gameBoard = new boardService.Board();
    $scope.data = {

    };
    $scope.offColorIdx = [];
    for (var i = 0; i < 64; ++i) {
        var rowIdx = Math.floor(i / 8);
        $scope.offColorIdx[i] = ((rowIdx % 2) + (i % 2)) % 2;
    }
    function updateBoard() {
        $scope.boardSquares = gameBoard.getSquares();
    }
  }]);
