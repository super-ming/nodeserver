const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());
//specify the endpoint in dishRouter, then group the methods by chaining them
dishRouter.route('/')
  .get((req, res, next) => {
    Dishes.find({}).then(dish => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(dish);
    }, err => next(err)).catch(err => next(err));
  })
  .post((req, res, next) => {
    Dishes.create(req.body).then(dish => {
      console.log('Dish created ', dish);
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(dish);
    }, err => next(err)).catch(err => next(err));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
  })
  .delete((req, res, next) => {
    Dishes.remove({}).then(res => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(res);
    }, err => next(err)).catch(err => next(err));
  });

//get the specific dishId parameter from req.params
dishRouter.route('/:dishId')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then(dish => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(dish);
    }, err => next(err)).catch(err => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/' + req.params.dishId);
  })
  .put((req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
      $set: req.body
    }, { new: true })
    .then(dish => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(dish);
    }, err => next(err)).catch(err => next(err));
  })
  .delete((req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then(res => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(res);
    }, err => next(err)).catch(err => next(err));
  });

dishRouter.route('/:dishId/comments')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId).then(dish => {
      if (dish != null) {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(dishes.comments);
      } else {
        err = new Error('Dish ' + req.params.dishId + ' not found');
        err.statusCode = 404;
        return next(err);
      }
    }, err => next(err))
    .catch(err => next(err));
  })
  .post((req, res, next) => {
    Dishes.findById(req.params.dishId).then(dish => {
      if (dish != null) {
        dish.comments.push(req.body);
        dish.save().then(dish => {
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json');
          res.json(dishes.comments);
        })
      } else {
        err = new Error('Dish ' + req.params.dishId + ' not found');
        err.statusCode = 404;
        return next(err);
      }
    }, err => next(err))
    .catch(err => next(err));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/' + req.params.dishId + '/comments');
  })
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishId).then(dish => {
      if (dish != null) {
        for (let i = dish.comments.length -1; i >= 0; i--) {
          dish.comments.id(dish.comments[i]._id).remove();
        }
        dish.save().then(dish => {
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json');
          res.json(dishes.comments);
        })
      } else {
        err = new Error('Dish ' + req.params.dishId + ' not found');
        err.statusCode = 404;
        return next(err);
      }
    }, err => next(err))
    .catch(err => next(err));
  });

//get the specific dishId parameter from req.params
dishRouter.route('/:dishId/comments/:commentId')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId).then(dish => {
      if (dish != null && dish.comments.id(req.params.commentId) != null) {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(dishes.comments.id(req.params.commentId));
      } else if (dish == null){
        err = new Error('Dish ' + req.params.dishId + ' not found');
        err.statusCode = 404;
        return next(err);
      } else {
        err = new Error('Comment ' + req.params.commentId + ' not found');
        err.statusCode = 404;
        return next(err);
      }
    }, err => next(err))
    .catch(err => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/' + req.params.dishId +
    '/comments/' + req.params.commentId);
  })
  .put((req, res, next) => {
    Dishes.findById(req.params.dishId).then(dish => {
      // Updating a sub-document inside a document in Mongoose. Mongoose has
      // no explicit method for updating an embedded subdocument
      if (dish != null && dish.comments.id(req.params.commentId) != null) {
        if (req.body.rating) {
          dish.comments.id(req.params.commentId).rating = req.body.rating
        }
        if (req.body.comment) {
          dish.comments.id(req.params.commentId).comment = req.body.comment
        }
        dish.save()
        .then(dish => {
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json');
          res.json(dishes.comments.id(req.params.commentId));
        }, err => next(err));
      } else if (dish == null){
        err = new Error('Dish ' + req.params.dishId + ' not found');
        err.statusCode = 404;
        return next(err);
      } else {
        err = new Error('Comment ' + req.params.commentId + ' not found');
        err.statusCode = 404;
        return next(err);
      }
    }, err => next(err))
    .catch(err => next(err));
  })
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishId).then(dish => {
      if (dish != null  && dish.comments.id(req.params.commentId) != null) {
          dish.comments.id(req.params.commentId).remove();
        dish.save().then(dish => {
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json');
          res.json(dishes.comments);
        })
      } else if (dish == null){
        err = new Error('Dish ' + req.params.dishId + ' not found');
        err.statusCode = 404;
        return next(err);
      } else {
        err = new Error('Comment ' + req.params.commentId + ' not found');
        err.statusCode = 404;
        return next(err);
      }
    }, err => next(err))
    .catch(err => next(err));
  });

module.exports = dishRouter;
