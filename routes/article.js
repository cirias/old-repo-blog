var Article = require('./../models/Article.js');
var Tag = require('./../models/Tag.js');

exports.post = function(req, res){
	var logged = !!req.session.username;
	if (req.session.username) {
		Tag.selectAll(function(err, tags){
			Article.initPostData();
			res.render('post', {
				tags: tags,
				logged: logged,
				title: 'Post',
				show: {sidebar: true}
			});
		});
	} else {
		res.send('You are not authorized to do this.');
	}
}

exports.upload = function(req, res){
	if (req.session.username) {
		Article.upload(req, function(err){
	    	if(err) {
				res.send({'success':false,'err':err.message});
			} else {
				Tag.save(req.body.tags, function(err){
					if(err) {
						res.send({'success':false,'err':err});
					} else {
						res.send({'success':true});
					}
				});
			}
	    });
	} else {
		res.send('You are not authorized to do this.');
	}
}

exports.show = function(req, res){
	var logged = !!req.session.username;
	Article.selectArticle(req, function(article, err){
		if (!article) res.redirect('/');
		if(err) {
			res.send({'success':false,'err':err});
		} else {
			Tag.selectAll(function(err, tags){
				res.render('anArticle', {
					article: article,
					tags: tags,
					logged: logged,
					title: article.title,
					show: {sidebar: true}
				});
			});
		}
	});
}

exports.home = function(req, res){
	showArticlesWith(Article.selectArticlesByNo, req, res, '/page');
}

exports.byTag = function(req, res){
	showArticlesWith(Article.selectArticlesByTag, req, res, '/tag/' + req.params.tag);
}

function showArticlesWith(showMethod, req, res, action){
	var logged = !!req.session.username;
	showMethod(req, function(articles, pagesNum, err){
		if (articles.length == 0) res.redirect('/');
		if(err) {
			res.send({'success':false,'err':err});
		} else {
			Tag.selectAll(function(err, tags){
				res.render('articleFlow', {
					articles: articles,
					tags: tags,
					logged: logged,
					pagesNum: pagesNum,
					currentPage: typeof req.params.no == 'undefined'? 0: req.params.no,
					action: action,
					title: 'Sight of Sirius',
					show: {sidebar: true}
				});
			});
		}
	});
}

exports.delete = function(req, res){
	if (req.session.username) {
		Article.delete(req, function(err){
			if(err){
				res.send({'success': false, 'err': err});
			} else {
				res.redirect('/');
			}
		});
	} else {
		res.send('You are not authorized to do this.');
	}
}

exports.edit = function(req, res){
	if (!req.session.username) {
		res.send('You are not authorized to do this.');
		return;
	}

	res.send('Opps! Where are my hands?!');
}

exports.uploadImage = function(req, res) {
	Article.uploadImage(req, function(err, path){
		res.send({err: err, path: path});
	});
}

exports.save = function(req, res) {
	if (req.session.username) {
		Article.save(req, function(err){
	    	if(err) {
				res.send({'success':false,'err':err.message});
			} else {
				Tag.save(req.body.tags, function(err){
					if(err) {
						res.send({'success':false,'err':err});
					} else {
						res.send({'success':true});
					}
				});
			}
	    });
	} else {
		res.send('You are not authorized to do this.');
	}
}