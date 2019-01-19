const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const FacebookTokenStrategy = require('passport-facebook-token');
const config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
//take care of support for sessions by passportLocalMongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => {
  return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;
//configure new passport strategy
exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT Payload: " + jwt_payload);
    User.findOne({_id: jwt_payload._id}, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
}));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req, res, next) => {
  if (req.user.admin) {
    next();
  } else {
    const err = new Error('You are not authorized to perform this task');
    err.status = 403;
    return next(err);
  }
};

//user sends access token to express server. Express server uses access token to fetch
//user profile from facebook.
exports.facebookPassport = passport.use(new FacebookTokenStrategy({
  clientID: config.facebook.clientId,
  clientSecret: config.facebook.clientSecret
  }, (accessToken, refreshToken, profile, done) => {
    //see if the facebook user has already logged in earlier
    User.findOne({facebookId: profile.id}, (err, user) => {
      if (err) {
        return done(err, false);
      }
      //user has already logged in with facebook id
      if (!err && user !== null) {
        return done(null, user);
      } else {
        //if user doesn't exist at facebook, create new profile
        user = new User({ username: profile.displayName });
        user.facebookId = profile.id;
        user.firstname = profile.name.givenName;
        user.lastname = profile.name.familyName;
        user.save((err,user) => {
          if (err) {
            return done(err, false);
          } else {
            return done(null, user);
          }
        })
      }
    });
  }
));
