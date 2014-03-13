var async = require('async');
var Article = require('./../models/Article.js');
var Tag = require('./../models/Tag.js');
var User = require('./../models/User.js');

exports.getAllArticles = function(req, res) {
	var logged = !!req.session.username;

	async.parallel({
		articles: function(cb){
			Article.SelectArray(req, {}, cb);
		},
		pageNum: function(cb){
			Article.GetPageNum({}, cb);
		},
		tags: function(cb){
	    	Tag.SelectAll(cb);
	    },
	    archives: function(cb){
	    	Article.GetArchives(cb);
	    }
	},function(err, results) {
		res.render('articleFlow', {
			articles: results.articles,
			pagesNum: results.pageNum,
			tags: results.tags,
			archives: results.archives,
			title: 'Sight of Sirius',
			logged: logged,
			currentPage: typeof req.params.no == 'undefined'? 0: req.params.no,
			action: '/page',
			show: {sidebar: true}
		});
	});
}

exports.getTagArticles = function(req, res) {
	var logged = !!req.session.username;

	async.parallel({
		articles: function(cb){
			Article.SelectArray(req, {tags: req.params.tag}, cb);
		},
		pageNum: function(cb){
			Article.GetPageNum({tags: req.params.tag}, cb);
		},
		tags: function(cb){
	    	Tag.SelectAll(cb);
	    },
	    archives: function(cb){
	    	Article.GetArchives(cb);
	    }
	},function(err, results) {
		res.render('articleFlow', {
			articles: results.articles,
			pagesNum: results.pageNum,
			tags: results.tags,
			archives: results.archives,
			title: 'Sight of Sirius',
			logged: logged,
			currentPage: typeof req.params.no == 'undefined'? 0: req.params.no,
			action: '/tag/',
			show: {sidebar: true}
		});
	});
}

exports.getArchiveArticles = function(req, res) {
	var logged = !!req.session.username;
	var start = new Date(req.params.year, req.params.month - 1, 1);
	var end = new Date(req.params.year, req.params.month, 1);

	async.parallel({
		articles: function(cb){
			Article.SelectArray(req, {date: {$gte: start, $lt: end}}, cb);
		},
		pageNum: function(cb){
			Article.GetPageNum({date: {$gte: start, $lt: end}}, cb);
		},
		tags: function(cb){
	    	Tag.SelectAll(cb);
	    },
	    archives: function(cb){
	    	Article.GetArchives(cb);
	    }
	},function(err, results) {
		res.render('articleFlow', {
			articles: results.articles,
			pagesNum: results.pageNum,
			tags: results.tags,
			archives: results.archives,
			title: 'Sight of Sirius',
			logged: logged,
			currentPage: typeof req.params.no == 'undefined'? 0: req.params.no,
			action: '/tag/',
			show: {sidebar: true}
		});
	});
}

exports.getAnArticle = function(req, res) {
	var logged = !!req.session.username;

	async.parallel({
	    tags: function(cb){
	    	Tag.SelectAll(cb);
	    },
	    article: function(cb){
	    	Article.SelectOne(req, cb);
	    },
	    archives: function(cb){
	    	Article.GetArchives(cb);
	    }
	}, function(err, results) {
		res.render('anArticle', {
			article: results.article,
			tags: results.tags,
			archives: results.archives,
			logged: logged,
			title: results.article.title,
			show: {sidebar: true}
		});
	});
}