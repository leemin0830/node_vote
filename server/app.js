var express = require('express');
var bodyParser = require('body-parser');
var restful = require('node-restful');
var mongoose = restful.mongoose;

var port = 8000;
var currentVoteId;
var currentCount=0;

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended : false
}));
// parse application/json
app.use(bodyParser.json());

var dir=__dirname.split('/');
dir.pop();
dir=dir.join('/');
console.log(dir+'/source/www');
app.use(express.static(dir+'/source/www'));

mongoose.connect("mongodb://localhost/vote");

var User = app.resource = restful.model('users', mongoose.Schema({
	date: { type: Date, default: Date.now }
})).methods([ 'get', 'post', 'put', 'delete' ]);

User.register(app, '/users');

var Vote = app.resource = restful.model('votes', mongoose.Schema({
	title : 'string',
})).methods([ 'get', 'post', 'put', 'delete' ]);

Vote.register(app, '/votes');

var VotingPaper = app.resource = restful.model('voting_papers', mongoose.Schema({
	vote_id:'string',
	date: { type: Date, default: Date.now },
	user_id:'string'
})).methods([ 'get', 'post', 'put', 'delete' ]);

VotingPaper.before('post', function(req, res, next) {
	  if(!currentVoteId){
		  res.status(500).send('no vote opened');
		  return;
	  }else{
		  req.body.vote_id=currentVoteId;
	  }
	  
	  if(!req.body.user_id){
		  res.status(401).send('unauthorized');
		  return;
	  }
	  
	  //중복 투표체크
	  VotingPaper.findOne({user_id:req.body.user_id,vote_id:currentVoteId}, function (err, votePaper) {
//		  next();  
//		  return;
		  if(votePaper){
			  console.log(votePaper)
			  res.status(405).send('already voted');
			  return;	  
		  }else{
			  next();  
		  }	  
	  });
	})
	
VotingPaper.after('post',function(req,res,next){
	currentCount++;
	io.emit('count', currentCount);
	next();
});

VotingPaper.register(app, '/voting_papers');

app.post('/current_vote',function(req,res,next){
	console.log(req.body.vote_id);
	res.send({success:'success'});
	currentVoteId=req.body.vote_id;
	
	VotingPaper.count({vote_id:currentVoteId},function(err,c){
		currentCount=c;
		console.log('emit count : ',currentCount);
		io.emit('count', currentCount);
	});
});

app.post('/end_vote',function(req,res,next){
	if(currentVoteId){
		console.log(currentVoteId);
		res.send({success:'success'});
		currentVoteId=undefined;
	}

});

server.listen(port);

io.on('connection', function(socket){
	  console.log('a user connected');
	  io.emit('count', currentCount);
	  socket.on('disconnect', function(){
	    console.log('user disconnected');
	  });
	});

module.exports = app;