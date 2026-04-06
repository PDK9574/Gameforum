var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('connect-flash');


var session = require('express-session')
var bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
//jquery
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = jQuery = require('jquery')(window);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var msgsRouter = require('./routes/msgs');
var mgrRouter = require("./routes/mgr");
var app = express();
// defualt public
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//檔案上傳
app.use(fileUpload());
//jquery
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
//


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(cookieParser());
app.use(session({
  secret: 'qwerfdsazxcvd123',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 1000*60*1000 }
 })
);
app.use(flash());

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/msgs', msgsRouter);
app.use("/mgr",mgrRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
