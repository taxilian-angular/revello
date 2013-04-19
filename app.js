
/**
 * Module dependencies.
 */

var express         = require('express');
var less_middleware = require("less-middleware");
var Deferred        = require('Deferred');
var app = module.exports = express();

app.configure('development', function() {
    app.use(express.logger({ format: ':method :url' }));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(less_middleware({
        src: __dirname + '/public',
        debug: true,
        force: true,
        compress: false
    }));
    app.use(express.static(__dirname + '/public'));
    app_mode = "dev";
});

app.configure(function() {
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

require('rest_api/game')(app);
app.listen(3000);



