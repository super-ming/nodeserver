const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
//file store creates a session folder and keep track of session info
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const authenticate = require('./authenticate');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');

const app = express();

const Dishes = require('./models/dishes');
const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then(db=> {
  console.log('Connected to server');
}, err => {
  console.log(err);
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//assign cookie secret key
//app.use(cookieParser('12345'));
//set up session to replace cookie
app.use(session({
  name: 'session-id',
  secret: '12345',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

//detect if user is already logged in. If so, add session
app.use(passport.initialize());
app.use(passport.session());
//these endpoints should be public so need to put it before authentication
app.use('/', indexRouter);
app.use('/users', usersRouter);

//add authentication before we allow users to fetch data from server
auth = (req, res, next) => {
  //if no user in session, then user has not been authenticated yet
  if (!req.user){
    let err = new Error('You are not authenticated!');
    err.status = 403;
    next(err);
  } else {
    next();
  }
};
//protect the endpoints below so that they can only be accessed if authenticated
app.use(auth);
//enables app to serve static files from public
app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

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
