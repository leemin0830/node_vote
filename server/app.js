var express = require('express');
var bodyParser = require('body-parser');
var restful = require('node-restful');
var mongoose = restful.mongoose;
var app = express();

var port = 8000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended : false
}))
// parse application/json
app.use(bodyParser.json())
app.use(express.query());

mongoose.connect("mongodb://localhost/elector");

var User = app.resource = restful.model('users', mongoose.Schema({
	nick : 'string'
})).methods([ 'get', 'post', 'put', 'delete' ]);

User.register(app, '/users');

var Group = app.resource = restful.model('groups', mongoose.Schema({
	name : 'string'
})).methods([ 'get', 'post', 'put', 'delete' ]);
Group.register(app, '/groups');


var Vote = app.resource = restful.model('votes', mongoose.Schema({
	name : 'string',
	items:'array',
	state:'string'
})).methods([ 'get', 'post', 'put', 'delete' ]);
Vote.register(app, '/votes');

var Item = app.resource = restful.model('items', mongoose.Schema({
	vote_id : 'string',
	title:'string',
	description:'string',
	count:'number'
})).methods([ 'get', 'post', 'put', 'delete' ]);
Item.register(app, '/items');

var Result = app.resource = restful.model('results', mongoose.Schema({
	item_id : 'string',
	user_id : 'string',
	description:'string',
	date: { type: Date, default: Date.now }
})).methods([ 'get', 'post', 'put', 'delete' ]);
Group.register(app, '/items');

app.listen(port);

module.exports = app;