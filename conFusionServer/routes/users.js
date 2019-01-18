const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/user');
const router = express.Router();
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

router.use(bodyParser.json())

/* GET users listing. */

//User endpoints
router.get('/', cors.corsWithOptions, (req, res, next) => {
  res.send('respond with a resource');
});

//simplify authentication process with passport
router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  //check if username already exists in database
  User.register(new User({username: req.body.username}), req.body.password, (err,user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
      //once user is successfully registered, set the first and last name if available
      if (req.body.firstname) {
        user.firstname = req.body.firstname;
      }
      if (req.body.lastname) {
        user.lastname = req.body.lastname;
      }
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return ;
        }
        //authenticate is successful, then second function gets executed
        passport.authenticate('local')(req, res, ()=> {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        });
      });
    }
  });
});

//if authenticated, passport automatically adds user property to req so you can then use req.user
router.post('/login', cors.corsWithOptions, passport.authenticate('local'),(req, res) => {
  //create token by searching for user by id in database
  let token = authenticate.getToken({_id: req.user._id})
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You\'re successfully logged in!'});
});

//use get instead of post because user doesn't need to supply any info in the body of the message
router.get('/logout', cors.corsWithOptions, (req, res) => {
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
