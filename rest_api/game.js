var _ = require('underscore');
var Board = require('../board');

module.exports = function(app) {

    // List students
    app.get('/game/create', function(req, res) {
        var b = new Board();
        res.json(b, 200);
    });
};
