var async = require('async');
var toMarkdown = require('to-markdown').toMarkdown;
var Recaptcha = require('recaptcha').Recaptcha;
var Article = require('./../models/Article.js');
var Tag = require('./../models/Tag.js');
var User = require('./../models/User.js');

var baduserMsg = 'You are not authorized to do this.';

var PUBLIC_KEY  = '6LcVwvASAAAAANxmyMLK6AxcjazTqrQtjJbm5QyE',
    PRIVATE_KEY = '6LcVwvASAAAAAPsnMBULLYFmUepcXFfSEdmcNr58';
//管理-GET
//发送提交文章页到客户端
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

//发送撰写文章页到客户端
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

//发送编辑文章页到客户端
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

//删除文章
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
//保存提交的文章及标签，返回异常
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

//保存撰写的文章及标签，返回异常
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

//保存编辑的文章及标签，返回异常
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

//保存上传的图片，返回异常
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

//清理无效的图片文件，返回异常
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

//发送登录页到客户端
exports.getLogin = function(req, res) {
	res.render('signIn');
}

//登出
exports.getLogout = function(req, res) {
	req.session.username = null;
	res.redirect('/');
}

//执行登录，返回成功与否
exports.postLogin = function(req, res) {
	// console.log(req.param('remember-me') == undefined)

	var data = {
        remoteip:  req.connection.remoteAddress,
        challenge: req.body.recaptcha_challenge_field,
        response:  req.body.recaptcha_response_field
    };

    var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY, data);

    recaptcha.verify(function(success, error_code) {
        if (success) {
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
        else {
            // Redisplay the form.
            res.redirect('/signin');
        }
    });
}