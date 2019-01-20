const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser,
	(req, res, next) => {
		Favorites.findOne({user: req.user._id})
		.populate('user dishes')
		.then(favorite => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(favorite);
		}, (err) => next(err))
		.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,
	(req, res, next) => {
		Favorites.findOne({user: req.user._id})
		.then(favorite => {
			if(favorite == null){
				favorite = {};
				favorite.user = req.user._id;
				favorite.dishes = req.body;
				Favorites.create(favorite)
				.then((favorite) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(favorite);
				}, (err) => next(err));
			} else {
				let hasNew = false;
				for(i in req.body){
          //if the dish is not in list of favorite dishes, add it
					if(favorite.dishes.indexOf(req.body[i]._id) === -1){
						favorite.dishes.push(req.body[i]);
						if(!hasNew){
							hasNew = true;
						}
					}
				}
				if(hasNew){
					favorite.save()
					.then(favorite => {
            Favorites.findById(favorite._id)
            .populate('user')
            .populate('dishes')
            .then(favorites = > {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorites);
            })
					}, (err) => next(err));
				}
				else{
					res.json(favorite);
				}
			}
		}, err => next(err))
		.catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser,
	(req, res, next) => {
	res.statusCode = 403;
	res.end("PUT operation not supported on /dishes");
})
.delete(cors.corsWithOptions, authenticate.verifyUser,
	(req, res, next) => {
		Favorites.remove({user: req.user._id})
		.then(resp => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(resp);
		}, err => next(err))
		.catch(err => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
.get(cors.cors, (req,res,next) => {
	Favorites.findOne({user: req.user._id})
	.then(favorites => {
		if (!favorites) {
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			return res.json({"exists": false, "favorites": favorites});
		} else if (favorites.dishes.indexOf(req.params.dishId) < 0) {
  			res.statusCode = 200;
  			res.setHeader("Content-Type", "application/json");
  			return res.json({"exists": false, "favorites": favorites});
		} else {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				return res.json({"exists": true, "favorites": favorites});
		}
	}, err => next(err))
	.catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,
	(req, res, next) => {
		Favorites.findOne({user: req.user._id})
		.then(favorite => {
			if(favorite == null){
				favorite = {};
				favorite.user = req.user._id;
				favorite.dishes = [];
				favorite.dishes.push(req.params.dishId);
				Favorites.create(favorite)
				.then(favorite => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(favorite);
				}, err => next(err));
			} else {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				if (favorite.dishes.indexOf(req.params.dishId) === -1) {
					favorite.dishes.push(req.params.dishId);
					favorite.save()
          .then(favorite => {
            Favorites.findById(favorite._id)
            .populate('user')
            .populate('dishes')
            .then(favorites = > {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorites);
            }, err => next(err))
				} else {
					res.json(favorite);
				}
			}
		}, err => next(err))
		.catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser,
	(req, res, next) => {
	res.statusCode = 403;
	res.end("PUT operation not supported on /favorites/:dishId");
})
.delete(cors.corsWithOptions, authenticate.verifyUser,
	(req, res, next) => {
		Favorites.findOne({user: req.user._id})
		.then(favorite => {
			let index = favorite.dishes.indexOf(req.params.dishId);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			if(index > -1){
				favorite.dishes.splice(index, 1);
				favorite.save()
				.then(favorite => {
					Favorites.findById(favorite._id)
					.populate('user')
					.populate('dishes')
					.then(favorite => {
						res.json(favorite);
					});
				}, err => next(err));
			} else {
				res.json(favorite);
			}
		}, err => next(err))
		.catch(err => next(err));
});

module.exports = favoriteRouter;
