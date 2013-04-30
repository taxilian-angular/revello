
/**
 * Module dependencies.
 */

var express         = require('express');
var less_middleware = require("less-middleware");
var Deferred        = require('Deferred');
var engine = require('ejs-locals');
var app = module.exports = express();

var app_mode;

var templateVarMiddleware = function(varsFunc) {
    return function(req, res, next) {
        res.locals(varsFunc());
        next();
    };
};

app.configure('development', function() {
    app.use(express.logger({ format: ':method :url' }));
    app.use(less_middleware({
        src: __dirname + '/public',
        debug: true,
        force: true,
        compress: false
    }));
    app.use(express["static"](__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.static(__dirname + '/public'));
    app_mode = "dev";
});

app.use(templateVarMiddleware(function() { return {
    _: require("underscore")
}; }));

app.configure(function() {
    app.engine('ejs', engine);
    app.set('views', __dirname + '/templates');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());

    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(app.router);
});

process.on('uncaughtException', function (err) {
  console.log('Caught unhandled exception: ', err);
  console.log("Stack: ", err.stack);
});

app.get("/", function(req, res){
    res.render('game', { });
});

require('./rest_api/game')(app);
app.listen(3000);
console.log("Listening on port 3000");



