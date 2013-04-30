require.config({
    baseUrl: "/scripts",
    shim: {
        underscore: { exports: '_' },
        backbone: { deps: ["underscore", "jquery"], exports: "Backbone" }
    },
    paths: {
        "backbone"   : "ext/backbone",
        "_tpl"       : "ext/tpl",
        "underscore" : "ext/underscore"
    }
});
define(["jquery", "underscore", "backbone", "core/board"], function($, _, Backbone, Board) {
    var board;
    var RevelloView = Backbone.View.extend({
        el: '#mainBoard',

        updateBoard: function() {
            var selector;
            var blackPositions = Board.b.getPieces(1);
            var whitePositions = Board.b.getPieces(2);

            this.$(".square.black, .square.white").addClass("occupied");
            selector = _.map(blackPositions, function(p) {
                return "#sq" + p;
            });
            this.$(selector.join(",")).removeClass("white").addClass("black");
            selector = _.map(whitePositions, function(p) {
                return "#sq" + p;
            });
            this.$(selector.join(",")).removeClass("black").addClass("white");
        }
    });

    $(function() {
        board = new RevelloView({el: $("#mainBoard")});

        board.updateBoard();
    });
});
