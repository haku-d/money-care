// server.js
// http://scotch.io/tutorials/javascript/build-a-restful-api-using-node-and-express-4

var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');
var morgan	   = require('morgan');
var passport   = require('passport');
var FacebookStrategy = require('passport-facebook');
var util = require('util');
var session = require('express-session');
var cookieParser = require("cookie-parser");

var mongoose	= require('mongoose');
	mongoose.connect('mongodb://127.0.0.1:27017');

var Bear     = require('./app/models/bear');
var User 	 = require('./app/models/user');

var FACEBOOK_APP_ID = '659090967545948';
var FACEBOOK_APP_SECRET = 'bbb15368050ed70ea19209eed210d17b';

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('combined')); // set app logger
app.use(cookieParser());
app.use(session({
  	secret: 'keyboard cat',
  	resave: false,
  	saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());

passport.use(new FacebookStrategy({
    	clientID: FACEBOOK_APP_ID,
    	clientSecret: FACEBOOK_APP_SECRET,
    	callbackURL: "http://localhost:3000/api/auth/facebook/callback"
  	},
  	function(accessToken, refreshToken, profile, done) {
  		User.findOneAndUpdate({ 
  			facebookId: profile.id 
  		}, {
  			facebookId: profile.id,
  			facebookProfile: profile
  		}, {upsert: true}, function (err, user) {
	      	return done(err, user);
	    });
  	}
));

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

router.use(function(req, res, next){
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback', 
	passport.authenticate('facebook', { failureRedirect: '/login' }), 
	function(req, res){
		res.redirect('/');
	});

router.route('/bears')

	// create a bear (accessed at POST http://localhost:8080/api/bears)
	.post(function(req, res) {
		
		var bear = new Bear(); 		// create a new instance of the Bear model
		bear.name = req.body.name;  // set the bears name (comes from the request)

		// save the bear and check for errors
		bear.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'Bear created!' });
		});
	})
	.get(function(req, res){
		// Find all bears
		Bear.find(function(err, bears){
			if(err) {
				res.send(err);
			}

			res.json(bears);
		});
	});

router.route('/bears/:bear_id')
	.get(function(req, res){
		Bear.findById(req.params.bear_id, function(err, bear){
			if(err) {
				res.send(err);
			}

			res.json(bear);
		});
	})
	.put(function(req, res){
		// use our bear model to find the bear we want
		Bear.findById(req.params.bear_id, function(err, bear) {

			if (err)
				res.send(err);

			bear.name = req.body.name; 	// update the bears info

			// save the bear
			bear.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Bear updated!' });
			});

		})
		.delete(function(req, res) {
			Bear.remove({
				_id: req.params.bear_id
			}, function(err, bear) {
				if (err)
					res.send(err);

				res.json({ message: 'Successfully deleted' });
			});
		});
	});
// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);