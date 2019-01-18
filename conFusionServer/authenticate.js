const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
let User = require('./models/user');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
//take care of support for sessions by passportLocalMongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
