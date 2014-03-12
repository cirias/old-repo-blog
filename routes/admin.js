var async = require('async');
var toMarkdown = require('to-markdown').toMarkdown;
var Article = require('./../models/Article.js');
var Tag = require('./../models/Tag.js');
var User = require('./../models/User.js');

var baduserMsg = 'You are not authorized to do this.';

//管理-GET
exports.getPost = function(req, res) {
	var logged = !!req.session.username;
	if (!req.session.username) {
		res.send({success: false, err: baduserMsg});
		return;
	}

	Article.InitPostEnvir();

	async.parallel({
	    tags: function(cb){
	    	Tag.SelectAll(cb);
	    }
	}, function(err, results) {
		    res.render('post', {
			tags: results.tags,
			logged: logged,
			title: 'Post',
			show: {sidebar: true}
		});
	});
}

exports.getWrite = function(req, res) {
	var logged = !!req.session.username;
	if (!req.session.username) {
		res.send({success: false, err: baduserMsg});
		return;
	}

	Article.InitPostEnvir();

	async.parallel({
	    tags: function(cb){
	    	Tag.SelectAll(cb);
	    }
	}, function(err, results) {
		    res.render('write', {
			tags: results.tags,
			logged: logged,
			title: 'Write',
			show: {sidebar: true}
		});
	});
}

exports.getEdit = function(req, res) {
	var logged = !!req.session.username;
	if (!req.session.username) {
		res.send({success: false, err: baduserMsg});
		return;
	}

	async.parallel({
	    tags: function(cb){
	    	Tag.SelectAll(cb);
	    },
	    article: function(cb){
	    	Article.SelectOne(req, cb);
	    }
	}, function(err, results) {
		var tags = [{}];
		var hidden = {
			hide: '',
			nothide: ''
		};

		async.each(results.tags, function(tag, callback) {
			if (results.article.tags.indexOf(tag.name) >= 0) {
				tag..checked = 'checked';
				console.log(tag);
				tags.push(tag);
				console.log(JSON.stringify(tags));
			}
			console.log(JSON.stringify(tags));
			callback();
		}, function() {
			if (results.article.hidden) {
				hidden.hide = 'checked';
			} else {
				hidden.nothide = 'checked';
			}

			console.log(JSON.stringify(tags));
			res.render('edit', {
				article: results.article,
				tags: results.tags,
				hidden: hidden,
				body: toMarkdown(results.article.content),
				logged: logged,
				title: 'Edit - ' + results.article.title,
				show: {sidebar: true}
			});
		});
	});
}

exports.getDelete = function(req, res) {
	var logged = !!req.session.username;
	if (!req.session.username) {
		res.send({success: false, err: baduserMsg});
		return;
	}

	Article.Delete(req, function(err){
		if(err){
			res.send({'success': false, 'err': err});
		} else {
			res.redirect('/');
		}
	});
}

//管理-POST
exports.postPost = function(req, res) {
	var logged = !!req.session.username;
	if (!req.session.username) {
		res.send({success: false, err: baduserMsg});
		return;
	}

	async.parallel([
	    function(cb){
	    	Tag.Add(req.body.tags, cb);
	    },
	    function(cb){
	    	Article.AddPost(req, cb);
	    }
	], function(err) {
	    if(err) {
			res.send({'success':false,'err':err});
		} else {
			res.send({'success':true});
		}
	});
}

exports.postWrite = function(req, res) {
	var logged = !!req.session.username;
	if (!req.session.username) {
		res.send({success: false, err: baduserMsg});
		return;
	}

	async.parallel([
	    function(cb){
	    	Tag.Add(req.body.tags, cb);
	    },
	    function(cb){
	    	Article.AddWrite(req, cb);
	    }
	], function(err) {
	    if(err) {
			res.send({'success':false,'err':err});
		} else {
			res.send({'success':true});
		}
	});
}

exports.postEdit = function(req, res) {
	var logged = !!req.session.username;
	if (!req.session.username) {
		res.send({success: false, err: baduserMsg});
		return;
	}
}

exports.postImage = function(req, res) {
	var logged = !!req.session.username;
	if (!req.session.username) {
		res.send({success: false, err: baduserMsg});
		return;
	}
	Article.SaveImage(req, function(err, path){
		res.send({
			err: err, 
			path: path
		});
	});
}

//登录
exports.getLogin = function(req, res) {
	res.render('signIn');
}

exports.postLogin = function(req, res) {
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