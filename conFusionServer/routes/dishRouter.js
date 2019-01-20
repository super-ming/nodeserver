const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());
//specify the endpoint in dishRouter, then group the methods by chaining them
dishRouter.route('/')
  //send options preflight request to verify CORS access first
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus = 200;
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.find(req.query)
    //use mongoose population to populate the author
    .populate('comments.author')
    .then(dish => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(dish);
    }, err => next(err)).catch(err => next(err));
  })
  //check for authentication before allowing user to make post request
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.create(req.body).then(dish => {
      console.log('Dish created ', dish);
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(dish);
    }, err => next(err)).catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.remove({}).then(resp => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(resp);
    }, err => next(err)).catch(err => next(err));
  });

//get the specific dishId parameter from req.params
dishRouter.route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus = 200;
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then(dish => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(dish);
    }, err => next(err)).catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/' + req.params.dishId);
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
      $set: req.body
    }, { new: true })
    .then(dish => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(dish);
    }, err => next(err)).catch(err => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then(res => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(res);
    }, err => next(err)).catch(err => next(err));
  });

module.exports = dishRouter;
