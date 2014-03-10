var Article = require('./../models/Article.js');
var Tag = require('./../models/Tag.js');
var User = require('./../models/User.js');

function HandleError(err, res) {
	if (err) {
		res.send({
			'success': false,
			'error': err
		});
	}
}

exports.write = function(req, res) {
	var logged = !!req.session.username;
	if (!req.session.username) {
		res.send('You are not authorized to do this.');
		console.log('over');
		return;
	}

	var tags = Tag.selectAll(function(err, tags) {
		HandleError(err, res);
		return tags;
	})

	res.render('write', {
		tags: tags,
		logged: logged,
		title: 'Write',
		show: {sidebar: true}
	})
}