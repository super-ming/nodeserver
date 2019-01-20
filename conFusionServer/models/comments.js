const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  //use as an objectId that references user document to get author info
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dish: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish'
  }
}, {
    timestamps: true
});

let Comments = mongoose.model('Comment', commentschema);
module.exports = Comments;
