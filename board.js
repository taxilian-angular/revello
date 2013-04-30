if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(["underscore"], function(_) {
    var otherPlayer = function(player) {
        if(player==2) { return 1; }
        return 2;
    };

    var Board = function() {
        var self=this;
        self.board = [
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 2, 1, 0, 0, 0,
        0, 0, 0, 1, 2, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0
        ];
    };

    Board.prototype.clone = function() {
        var ret = new Board();
        ret.board = this.board.slice(0);
        return ret;
    };

    Board.prototype.setBoard = function(b) {
        this.board = b;
    };

    Board.prototype.checkPos = function(pos) {
        if((pos.r<0)||(pos.r>=8) || (pos.c<0) || (pos.c>=8)) { return 0; }
        else { return this.board[8*pos.r + pos.c] ; }
    };

    var directions = [
        function(startPos, index) { return {r: startPos.r, c: startPos.c-index}; },
        function(startPos, index) { return {r: startPos.r, c: startPos.c+index}; },
        function(startPos, index) { return {r: startPos.r-index, c: startPos.c}; },
        function(startPos, index) { return {r: startPos.r+index, c: startPos.c}; },
        function(startPos, index) { return {r: startPos.r-index, c: startPos.c-index}; },
        function(startPos, index) { return {r: startPos.r-index, c: startPos.c+index}; },
        function(startPos, index) { return {r: startPos.r+index, c: startPos.c-index}; },
        function(startPos, index) { return {r: startPos.r+index, c: startPos.c+index}; }
    ];


    /* Do a search along direction.
     * First position (after starting position) must be startPlayer (or we will return false).
     * Continues search until either endPlayer or 0 is found.
     *  if endPlayer is found return true;
     *  if end of board or 0 is found return false;
     */
    Board.prototype.doSearch= function(startPos, dir, currentPlayer) {
        var ret = [];
        var oppPlayer = otherPlayer(currentPlayer);

        var self = this;
        var nextPos = dir(startPos, 1);
        if(self.checkPos(nextPos) != oppPlayer) { return []; }
        else { ret.push(nextPos); }

        var ind;
        for(ind=2;ind<8;ind++) {
            var pos = dir(startPos, ind);
            var x = self.checkPos(pos);
            if(!x) {
                return [];
            } else if(x==currentPlayer) {
                return ret;
            } else {
                ret.push(pos);
            }
        }
        return [];
    };


    Board.prototype.playMove = function(pos,player) {
        if(pos===null) { return; }
        var swaps = [];
        var self=this;
        _.each(directions, function(d) {
            swaps=swaps.concat(self.doSearch(pos, d, player));
        });
        swaps.push(pos);
        if(swaps.length <= 1) {
            console.log("Invalid move");
            console.dir(swaps);
        } else {
            _.each(swaps, function(p) {
                self.board[8*p.r + p.c] = player;
            });
        }
    };

    Board.prototype.getValidMoves = function(player) {
        var self=this;
        var oppPlayer = otherPlayer(player);
        var ret = [];
        var pos;

        _.times(8, function(r) {
            _.times(8, function(c) {
                pos={r:r, c:c};

                if(self.checkPos(pos)) { return; }
                if(_.any(directions, function(d) { return self.doSearch(pos, d, player).length > 0; })) {
                    ret.push(pos);
                }
            });
        });
        return ret;
    };


    Board.prototype.getSeq = function(pos, delta, cnt) {
        var ret = "";
        var i;
        var p={r:pos.r, c:pos.c};
        for(i=0;i<cnt;i++) {
            ret+=String(this.checkPos(p));
            p.r += delta.r;
            p.c += delta.c;
        }
        return ret;

    };


    // Returns 2x3 corner sequences
    Board.prototype.getCorners = function() {
        var self=this;

        return [
            // TL corner
            self.getSeq({r:0, c:0}, {r:0, c:1}, 3) + self.getSeq({r:1, c:0}, {r:0, c:1}, 3),
            // TL inverted corner
            self.getSeq({r:0, c:0}, {r:1, c:0}, 3) + self.getSeq({r:0, c:1}, {r:1, c:0}, 3),
            // TR corner
            self.getSeq({r:0, c:7}, {r:0, c:-1}, 3) + self.getSeq({r:1, c:7}, {r:0, c:-1}, 3),
            // TR inverted corner
            self.getSeq({r:0, c:7}, {r:1, c:0}, 3) + self.getSeq({r:0, c:6}, {r:1, c:0}, 3),
            // BL corner
            self.getSeq({r:7, c:0}, {r:0, c:1}, 3) + self.getSeq({r:6, c:0}, {r:0, c:1}, 3),
            // BL inverted corner
            self.getSeq({r:7, c:0}, {r:-1, c:0}, 3) + self.getSeq({r:7, c:1}, {r:-1, c:0}, 3),
            // BR corner
            self.getSeq({r:7, c:7}, {r:0, c:-1}, 3) + self.getSeq({r:6, c:7}, {r:0, c:-1}, 3),
            // BR inverted corner
            self.getSeq({r:7, c:7}, {r:-1, c:0}, 3) + self.getSeq({r:7, c:6}, {r:-1, c:0}, 3)
        ];
    };

    // Return edge sequences
    Board.prototype.getEdges = function() {
        var self=this;
        return [
            self.getSeq({r:0,c:0}, {r:0, c:1}, 8),
            self.getSeq({r:0,c:0}, {r:1, c:0}, 8),

            self.getSeq({r:0,c:7}, {r:0, c:-1}, 8),
            self.getSeq({r:0,c:7}, {r:1, c:0}, 8),

            self.getSeq({r:7,c:0}, {r:0, c:1}, 8),
            self.getSeq({r:7,c:0}, {r:-1, c:0}, 8),

            self.getSeq({r:7,c:7}, {r:0, c:-1}, 8),
            self.getSeq({r:7,c:7}, {r:-1, c:0}, 8)

        ];

    };

    Board.prototype.print = function() {
        var self=this;
        for(var r=0; r<8; r++) {
            var s="";
            for(var c=0; c< 8; c++) {
                switch(self.checkPos({r:r, c:c})) {
                    case 0:
                        s+="  ";
                        break;
                    case 1:
                        s+="B ";
                        break;
                    case 2:
                        s+="W ";
                        break;
                }
            }
            console.log(s);
        }
    };

    Board.prototype.getScore = function() {
        var self=this;
        var bcnt=0, wcnt=0;
        _.each(self.board, function(x) {
            if(x==1) { bcnt++; }
            else if(x==2) { wcnt++; }
        });
        return {black: bcnt, white: wcnt};
    };

    Board.prototype.getPlayerScore = function(player) {
        var cnt=0;
        _.each(this.board, function(x) {
            if(x==player) { cnt++; }
        });
        return cnt;
    };

    Board.prototype.getRemaining = function() {
        return this.getPlayerScore(0);
    };

    Board.prototype.getPieces = function(player) {
        var self = this;
        var list = [];
        _.each(self.board, function(x, n) {
            if (x == player) {
                list.push(n);
            }
        });
        return list;
    };

    // Print with possible moves
    Board.prototype.printWithMoves = function(player) {
        var self=this;
        var bcnt=0, wcnt=0;
        var board = _.map(self.board, function(x) {
            if(x==1) { bcnt++; return "B"; }
            else if(x==2) { wcnt++; return "W"; }
            else { return "."; }
        });
        console.log("Black " + bcnt + ". White " + wcnt + ".");

        _.each(self.getValidMoves(player), function(pos, cnt) {
            board[8*pos.r + pos.c] = ""+cnt;
        });
        for(var r=0; r<8; r++) {
            var s="";
            for(var c=0; c< 8; c++) {
                s+=board[8*r + c] + " ";
            }
            console.log(s);
        }
    };

    Board.b = new Board();
    return Board;
});
