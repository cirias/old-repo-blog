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
	    },
	    archives: function(cb){
	    	Article.GetArchives(cb);
	    }
	}, function(err, results) {
		res.render('post', {
			tags: results.tags,
			archives: results.archives,
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
	    },
	    archives: function(cb){
	    	Article.GetArchives(cb);
	    }
	}, function(err, results) {
		res.render('write', {
			tags: results.tags,
			archives: results.archives,
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
	    	Article.getArticleData(req, cb);
	    },
	    archives: function(cb){
	    	Article.GetArchives(cb);
	    }
	}, function(err, results) {
		if(err){
			res.send({'success': false, 'err': err});
			return;
		}

		if(!results.article){
			res.send({'success': false, 'err': 'Article dosen\'t exist.'});
			return;
		}

		var date = results.article.date.toJSON().slice(0,10);
		var tags = [{}];
		var hidden = {
			hide: '',
			nothide: ''
		};

		for (i = 0; i < results.tags.length; i++) {
			tags.push(results.tags[i]);
			if (results.article.tags.indexOf(results.tags[i].name) >= 0) {
				tags[tags.length-1] = JSON.parse(JSON.stringify(tags[tags.length-1]).replace('}', ',"checked": true}'));
			}
		}

		tags.splice(0,1);

		if (results.article.hidden) {
			hidden.hide = 'checked';
		} else {
			hidden.nothide = 'checked';
		}

		if (results.article.oriContent == undefined) {
			results.article.oriContent = toMarkdown(results.article.content);
		}

		res.render('edit', {
			article: results.article,
			archives: results.archives,
			date: date,
			tags: tags,
			hidden: hidden,
			body: results.article.oriContent,
			logged: logged,
			title: 'Edit - ' + results.article.title,
			show: {sidebar: true}
		});
	});
}

exports.getDelete = function(req, res) {
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
	if (!req.session.username) {
		res.send({success: false, err: baduserMsg});
		return;
	}

	async.parallel([
	    function(cb){
	    	Tag.Add(req.body.tags, cb);
	    },
	    function(cb){
	    	Article.updateArticleData(req, cb);
	    }
	], function(err) {
	    if(err) {
			res.send({'success':false,'err':err});
		} else {
			res.send({'success':true});
		}
	});
}

exports.postImage = function(req, res) {
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

exports.getClean = function(req, res) {
	if (!req.session.username) {
		res.send({success: false, err: baduserMsg});
		return;
	}
	
	Article.DeleteUselessDir(function(err) {
		if(err) {
			res.send({'success':false,'err':err});
		} else {
			res.send({'success':true});
		}
	});
}

//登录
exports.getLogin = function(req, res) {
	res.render('signIn');
}

exports.getLogout = function(req, res) {
	req.session.username = null;
	res.redirect('/');
}

exports.postLogin = function(req, res) {
	// console.log(req.param('remember-me') == undefined)

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