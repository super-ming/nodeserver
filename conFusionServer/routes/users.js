const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/user');
const router = express.Router();

router.use(bodyParser.json())

/* GET users listing. */

//User endpoints
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  //check if username already exists in database
  User.findOne({username: req.body.username})
  .then(user => {
    if (user != null) {
      let err = new Error('User ' + req.body.username + ' already exists!');
      err.status = 403;
      next(err);
    } else {
      return User.create({
        username: req.body.username,
        password: req.body.password
      })
    }
  })
  .then(user => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful!', user: user});
  }, err => next(err))
  .catch(err => next(err));
});

router.post('/login', (req, res, next) => {
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
    let username = auth[0];
    let password = auth[1];
    //check if user already exists in database. If so, see if supplied username and password match
    User.findOne({username: username})
    .then(user => {
      if (user === null) {
        let err = new Error('User ' + username + 'doesn\'t exist!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 403;
        return next(err);
      } else if (user.password !== password) {
        let err = new Error('Your password is incorrect.');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 403;
        return next(err);
      } else if (user.username === username && user.password === password) {
        //go to next middleware
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated.');
      }
    })
    .catch(err => next(err))
  }
  //if req.session.user is not null, then user is already logged in
  else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated.');
  }
});

//use get instead of post because user doesn't need to supply any info in the body of the message
router.get('/logout', (req, res) => {
  //if there is a session, invalidate the session from the server
  if (req.session) {
    req.session.destroy();
    //clear cookie from client
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    let err = new Error('You are not logged in!');
    err.status = 403;
  }
});

module.exports = router;
