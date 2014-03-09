var User = require('./../models/User.js');

exports.doSignin = function(req, res){
	User.signin(req, function(err, pass){
		if(err) {
			res.send({'success':false,'err':err});
		} else {
			if (pass) {
				req.session.username = req.body.username;
				res.redirect('/');
			} else res.send({'success': false, 'err': 'Bad user'});
		}
	});
}

exports.signin = function(req, res){
	res.render('signIn');
}