const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const favoriteSchema = new Schema({
  user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		unique: true
	},
	dishes: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Dish'
	}]
  }, {
  	timestamps: true
});
//passport local mongoose will automatically add username and password to schema
User.plugin(passportLocalMongoose);

let Favorites = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorites;
