const mongoose = require('mongoose');
const Dishes = require('./models/dishes');
const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then(db => {
  console.log('Connected to the server');

  Dishes.create({
    name: 'hahapizza',
    description: 'haha'
  })
  .then(dish => {
    console.log(dish);
    return Dishes.findByIdAndUpdate(dish._id, {
      $set: { description: 'Updated test'}
    }, {
      //return updated dish
      new: true
    }).exec();
  })
  .then(dish => {
    console.log(dish);
    dish.comments.push({
      rating: 5,
      comment: 'I\'m getting a stinking feeling',
      author: 'Leo Cap'
    });
    return dish.save();
  })
  .then(dish => {
    console.log(dish);
    return Dishes.remove({});
  })
  .then(() => {
    return mongoose.connection.close();
  })
  .catch(err => {
    console.log(err);
  })
})
