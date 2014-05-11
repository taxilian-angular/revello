/*global angular,Firebase,_,FirebaseSimpleLogin*/
angular.module('RevelloApp.controllers', []).
    controller('revelloController', ['$scope', '$rootScope', '$routeParams', 'gameSyncService', 'boardService', function($scope, $rootScope, $routeParams, gameSync, boardService) {
    var gameBoard = new boardService.Board();
    var otherPlayer = function(player) {
        if(player==2) { return 1; }
        return 2;
    };

    var moveList = [];
    var currentMoveName = null;
    $scope.proposedMove = null;

    var updateBoard = _.debounce(_boardUpdate, 50);

    // State variables
    $scope.boardLoaded = true;
    $scope.boardSquares = [];
    $scope.player = 1;
    $scope.won = false;
    $scope.offColorIdx = boardService.offColorIdx;

    var gameRef = gameSync.loadGame($routeParams.gameId);
    var movesRef = gameRef.child("moves");
    var gameState = null;
    function isPlayer(num) {
        if (num == 1 && $rootScope.logged_in.uid == gameState.player1.id) {
            return true;
        } else if (num == 2 && gameState.player2 && $rootScope.logged_in.uid == gameState.player2.id) {
            return true;
        }
        return false;
    }
    gameRef.on("value", function(updateObj) {
        var gameUpdate = updateObj.val();
        $scope.player1_name = gameUpdate.player1.name;
        $scope.player2_name = gameUpdate.player2 ? gameUpdate.player2.name : null;
        $scope.myPlayer = gameUpdate.turn;
        gameState = gameUpdate;
    });
    movesRef.on('child_added', function(data) {
        moveList.unshift(data.val());
        if (data.name() != currentMoveName) {
            currentMoveName = data.name();
            $scope.proposedMove = null;
        }
        updateBoard();
    });

    // Methods to be called from the view
    $scope.makeMove = function(idx) {
        if ($scope.proposedMove !== null) {
            // ignore all moves while we have a proposed move
            return;
        } else if (idx === null) {
            // Pass the turn
            $scope.proposedMove = "skip";
            $scope.sendMove();
        } else if ($scope.boardSquares[idx] != 'O') {
            // Not a valid move
            return;
        } else {
            var pos = {
                r: Math.floor(idx / 8),
                c: idx % 8
            };
            $scope.proposedMove = pos;
        }
        updateBoard();
    };
    $scope.join_game = function() {
        if (!gameState || gameState.player2) {
            // Shouldn't be possible to get here; sanity check
            return false;
        }
        gameState.player2 = {name: $rootScope.logged_in.displayName, id: $rootScope.logged_in.uid};
        gameRef.set(gameState);
    };

    $scope.sendMove = function() {
        if (!$scope.proposedMove) {
            // shouldn't ever get here; sanity check
            return;
        } else if (!isPlayer($scope.player)) {
            // If we aren't the current player, ignore all moves
            return;
        }
        if ($scope.proposedMove != "skip") {
            gameBoard.playMove($scope.proposedMove, $scope.player);
        }
        movesRef.push().set({
            turn: otherPlayer($scope.player),
            board: gameBoard.toString(),
            lastMove: $scope.proposedMove
        });
    };
    $scope.cancelMove = function() {
        $scope.proposedMove = null;
        updateBoard();
    };

    // Updates the state after a change
    function _boardUpdate() {
        var sqr, moves;
        gameBoard = boardService.Board.fromString(moveList[0].board);
        var move = $scope.proposedMove || moveList[0].lastMove;
        $scope.player = moveList[0].turn;
        sqr = $scope.boardSquares = gameBoard.getSquares();
        if ($scope.proposedMove) {
            gameBoard.playMove($scope.proposedMove, $scope.player);
            $scope.movesPossible = false;
            sqr = $scope.boardSquares = gameBoard.getSquares();
        } else {
            moves = gameBoard.getValidMoves($scope.player);
            $scope.movesPossible = moves.length;
            _.each(moves, function(move) {
                var idx = move.r*8+move.c;
                sqr[idx] = 'O';
            });
        }
        if (move && move != 'skip') {
            $scope.lastMoveIdx = move.r*8+move.c;
        }
        $scope.canMove = isPlayer($scope.player);
        $scope.p1Score = 0;
        $scope.p2Score = 0;
        for (var i = 0; i < sqr.length; ++i) {
            if (sqr[i] == 1) { $scope.p1Score++; }
            if (sqr[i] == 2) { $scope.p2Score++; }
        }
        // Test to see if the game is over
        if (!$scope.proposedMove && moves.length === 0 && gameBoard.getValidMoves(otherPlayer($scope.player)).length === 0) {
            if ($scope.p1Score > $scope.p2Score) {
                $scope.won = "Player 1 won " + $scope.p1Score + " to " + $scope.p2Score + "!";
            } else if ($scope.p2Score > $scope.p1Score) {
                $scope.won = "Player 2 won " + $scope.p2Score + " to " + $scope.p1Score + "!";
            } else {
                $scope.won = "You tied, it's a draw! " + $scope.p2Score + " to " + $scope.p1Score + "!";
            }

        }
        $scope.$digest();
    }
}])
.controller('listController', ['$scope', '$rootScope', 'gameSyncService', 'boardService', function($scope, $rootScope, gameSync, boardService) {
    $scope.gameList = [];
    var gameListRef = gameSync.getList();

    // minor optimization to not digest until 50ms after the last item
    // is added to the list
    var digest = _.debounce(_.bind($scope.$digest, $scope), 50);

    gameListRef.on('child_added', function(data) {
        $scope.gameList.push({
            name: data.name(), val: data.val()
        });
        digest();
    });
    $scope.startNewGame = function($event) {
        $event.preventDefault();
        var newGame = gameSync.newGame();
        var newBoard = new boardService.Board();
        // Create the new game
        newGame.set({
            creator_id: $rootScope.logged_in.uid,
            created_at: new Date(),
            player1: {id: $rootScope.logged_in.uid, name: $rootScope.logged_in.displayName},
            player2: null
        });
        newGame.child("moves").push().set({
            turn: 1,
            board: newBoard.toString()
        });
    };
}])
.controller('rootControllerThingy', ['$rootScope', 'firebaseRef', function($rootScope, dbRef) {
    var auth = new FirebaseSimpleLogin(dbRef, function(error, user) {
        if (error) {
            // an error occurred while attempting login
            console.log(error);
        } else if (user) {
            // user authenticated with Firebase
            console.log('User ID: ' + user.uid + ', Provider: ' + user.provider);
            $rootScope.logged_in = user;
        } else {
            $rootScope.logged_in = false;
        }
        $rootScope.$digest();
    });
    $rootScope.doLogin = function(evt) {
        evt.preventDefault();
        auth.login("github");
    };
    $rootScope.doLogout = function(evt) {
        evt.preventDefault();
        auth.logout();
    };
}]);
