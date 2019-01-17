const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
//file store creates a session folder and keep track of session info
let FileStore = require('session-file-store')(session);

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

//add authentication before we allow users to fetch data from server
auth = (req, res, next) => {
  console.log(req.session);
  //if no user in session, then user has not been authenticated yet
  if (!req.session.user){
    let authHeader = req.headers.authorization;
    if (!authHeader) {
      let err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
    //set up authentication
    //split into two arrays containing username and password
    let auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    let user = auth[0];
    let password = auth[1];
    //if authentication is successful, add an user to session
    if (user === 'admin' && password === 'password') {
      //go to next middleware
      req.session.user = 'admin';
      next();
    } else {
      let err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
  } else {
    if(req.session.user === 'admin') {
      next();
    } else {
      let err = new Error('You are not authenticated!');
      err.status = 401;
      return next(err);
    }
  }
}
app.use(auth);
//enables app to serve static files from public
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
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
