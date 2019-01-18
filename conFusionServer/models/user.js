const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
  admin: {
    type: Boolean,
    default: false
  }
});
//passport local mongoose will automatically add username and password to schema
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
