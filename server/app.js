var express = require('express');
var bodyParser = require('body-parser');
var restful = require('node-restful');
var mongoose = restful.mongoose;
var app = express();

var port = 8000;
var currentVoteId;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended : false
}))
// parse application/json
app.use(bodyParser.json())

mongoose.connect("mongodb://localhost/vote");

var User = app.resource = restful.model('users', mongoose.Schema({
	date: { type: Date, default: Date.now }
})).methods([ 'get', 'post', 'put', 'delete' ]);

User.register(app, '/users');

var Vote = app.resource = restful.model('votes', mongoose.Schema({
	title : 'string',
})).methods([ 'get', 'post', 'put', 'delete' ]);

Vote.register(app, '/votes');

var VotingPaper = app.resource = restful.model('voting_paper', mongoose.Schema({
	vote_id:'string',
	date: { type: Date, default: Date.now },
	user_id:'string'
})).methods([ 'get', 'post', 'put', 'delete' ]);

VotingPaper.before('post', function(req, res, next) {
	  if(!currentVoteId){
		  res.status(500).send({ error: 'no vote opened' });
		  return;
	  }else{
		  req.body.vote_id=currentVoteId;
	  }
	  
	  if(!req.body.user_id){
		  res.status(401).send({ error: 'unauthorized' });
		  return;
	  }
	  
	  //중복 투표체크
	  VotingPaper.findOne({user_id:req.body.user_id,vote_id:currentVoteId}, function (err, votePaper) {
		  if(votePaper){
			  console.log(votePaper)
			  res.status(500).send({ error: 'already voted' });
			  return;	  
		  }else{
			  next();  
		  }	  
	  });
	  

	})

VotingPaper.register(app, '/voting_paper');

app.put('/current_vote',function(req,res,next){
	console.log(req.body.vote_id);
	res.send({success:'success'});
	currentVoteId=req.body.vote_id;
});


app.listen(port);

module.exports = app;