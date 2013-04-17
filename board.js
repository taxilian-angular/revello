
var _ = require('underscore');

var otherPlayer = function(player) {
    if(player==2) { return 1; } 
    return 2;
}

var Board = function() {
    var self=this;
    self.board = [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 2, 0, 0, 0,
    0, 0, 0, 2, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
    ];
};

Board.prototype.clone = function() {
    var ret = new Board();
    ret.board = this.board.slice(0);
    return ret;
}


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
 * direction can be 'U','D','L','R','UL','UR','DL','DR'
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
        if(x==0) {
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

    for(var r=0;r<8; r++) {
        for(var c=0;c<8; c++) {
            pos={r:r, c:c};

            if(self.checkPos(pos)) { continue; }
            if(_.any(directions, function(d) { return self.doSearch(pos, d, player).length > 0; })) {
                ret.push(pos);
                continue;
            }
        }
    }
    return ret;
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





module.exports = Board;

var b = new Board();

module.exports.b = b;
