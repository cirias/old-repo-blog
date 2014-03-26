var async = require('async');
var Article = require('./../models/Article.js');
var Tag = require('./../models/Tag.js');
var User = require('./../models/User.js');

//发送主页到客户端
exports.getAllArticles = function(req, res) {
	var logged = !!req.session.username;
	var query = {hidden: false};
	
	if (logged) {
		query = {};
	}

	async.parallel({
		articles: function(cb){
			Article.SelectArray(req, query, cb);
		},
		pageNum: function(cb){
			Article.GetPageNum(query, cb);
		},
		tags: function(cb){
	    	Tag.SelectAll(cb);
	    },
	    archives: function(cb){
	    	Article.GetArchives(cb);
	    }
	},function(err, results) {
		if (err) {
			res.send('ERROR: 500\n' + err);
			return;
		}

		if (!results.articles) {
			res.render('notfound', {
				content: 'Not Found 404',
				tags: results.tags,
				archives: results.archives,
				logged: logged,
				title: 'Not Found 404',
				show: {sidebar: true}
			});
			return;
		}

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

//根据标签发送文章流到客户端
exports.getTagArticles = function(req, res) {
	var logged = !!req.session.username;
	var query = {tags: req.params.tag, hidden: false};
	
	if (logged) {
		query = {tags: req.params.tag};
	}

	async.parallel({
		articles: function(cb){
			Article.SelectArray(req, query, cb);
		},
		pageNum: function(cb){
			Article.GetPageNum(query, cb);
		},
		tags: function(cb){
	    	Tag.SelectAll(cb);
	    },
	    archives: function(cb){
	    	Article.GetArchives(cb);
	    }
	},function(err, results) {
		if (err) {
			res.send('ERROR: 500\n' + err);
			return;
		}

		if (!results.articles) {
			res.render('notfound', {
				content: 'Not Found 404',
				tags: results.tags,
				archives: results.archives,
				logged: logged,
				title: 'Not Found 404',
				show: {sidebar: true}
			});
			return;
		}

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

//根据归档发送文章流到客户端
exports.getArchiveArticles = function(req, res) {
	var logged = !!req.session.username;
	var start = new Date(req.params.year, req.params.month - 1, 1);
	var end = new Date(req.params.year, req.params.month, 1);
	var query = {date: {$gte: start, $lt: end}, hidden: false};
	
	if (logged) {
		query = {date: {$gte: start, $lt: end}};
	}

	async.parallel({
		articles: function(cb){
			Article.SelectArray(req, query, cb);
		},
		pageNum: function(cb){
			Article.GetPageNum(query, cb);
		},
		tags: function(cb){
	    	Tag.SelectAll(cb);
	    },
	    archives: function(cb){
	    	Article.GetArchives(cb);
	    }
	},function(err, results) {
		if (err) {
			res.send('ERROR: 500\n' + err);
			return;
		}

		if (!results.articles) {
			res.render('notfound', {
				content: 'Not Found 404',
				tags: results.tags,
				archives: results.archives,
				logged: logged,
				title: 'Not Found 404',
				show: {sidebar: true}
			});
			return;
		}

		res.render('articleFlow', {
			articles: results.articles,
			pagesNum: results.pageNum,
			tags: results.tags,
			archives: results.archives,
			title: 'Sight of Sirius',
			logged: logged,
			currentPage: typeof req.params.no == 'undefined'? 0: req.params.no,
			action: '/archive/' + req.params.year + '/' + req.params.month,
			show: {sidebar: true}
		});
	});
}

//根据标题发送单篇文章到客户端
exports.getAnArticle = function(req, res) {
	var logged = !!req.session.username;
	var query = {title: req.params.title, hidden: false};

	if (logged) {
		query = {title: req.params.title};
	}

	async.parallel({
	    tags: function(cb){
	    	Tag.SelectAll(cb);
	    },
	    article: function(cb){
	    	Article.SelectOne(query, cb);
	    },
	    archives: function(cb){
	    	Article.GetArchives(cb);
	    }
	}, function(err, results) {
		if (err) {
			res.send('ERROR: 500\n' + err);
			return;
		}

		if (!results.article) {
			res.render('notfound', {
				content: 'Not Found 404',
				tags: results.tags,
				archives: results.archives,
				logged: logged,
				title: 'Not Found 404',
				show: {sidebar: true}
			});
			return;
		}

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

//发送404页
exports.notfound = function(req, res) {
	var logged = !!req.session.username;

	async.parallel({
	    tags: function(cb){
	    	Tag.SelectAll(cb);
	    },
	    archives: function(cb){
	    	Article.GetArchives(cb);
	    }
	}, function(err, results) {
		if (err) {
			res.send('ERROR: 500\n' + err);
			return;
		}

		res.render('notfound', {
			content: 'Not Found 404',
			tags: results.tags,
			archives: results.archives,
			logged: logged,
			title: 'Not Found 404',
			show: {sidebar: true}
		});
	});
}