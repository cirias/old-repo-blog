var async = require('async');
var fs = require('fs');
var path = require('path');
var guid = require('./Guid');
var mongodb = require('./mongodb');
var markdown = require( "markdown" ).markdown;
var toMarkdown = require('to-markdown').toMarkdown;

var Schema = mongodb.mongoose.Schema;
var ArticleSchema = new Schema(
    {
        title : String,
        tags : [String],
        date : {type: Date, default: Date.now},
        dir : String,
        hidden : Boolean,
        oriContent : String,
        content : String
    }
);
var Article = mongodb.mongoose.model("Article", ArticleSchema);
var ArticleDAO = function(){};
module.exports = new ArticleDAO();

//查询
var limition = 5;								//文章流每页最多显示文章数目

//返回页数
ArticleDAO.prototype.GetPageNum = function(params, callback) {
	Article.count(params).exec(function(err, count){
		callback(err, Math.ceil(count/limition));
	});
}

//返回一篇文章
ArticleDAO.prototype.SelectOne = function(params, callback){
	Article.findOne(params, function(err, article){
		callback(err, article);
	});
}

//返回一组文章
ArticleDAO.prototype.SelectArray = function(req, params, callback) {
	var no = req.params.no;
	no = typeof no !== 'undefined' ? no : 0;

	Article.find(params).sort({date: '-1'}).skip(no * limition).limit(limition).exec(function(err, articles){
		callback(err, articles);
	});
}

//月份对应英文名
var monthName = ['January ', 'February ', 'March ', 'April ', 'May ', 'June ', 'July ', 'August ', 'September ', 'October ', 'November ', 'December '];

//获取归档名称数组
ArticleDAO.prototype.GetArchives = function(callback) {
	Article.find({}, 'date').sort({date: '-1'}).exec(function(err, articles) {
		var archives = [];
		for (var i = 0; i < articles.length; i++) {
			var month = monthName[articles[i].date.getMonth()];
			var year = articles[i].date.getFullYear();
			var date = month + year;
			var has = false;

			for (var j = 0; j < archives.length; j++) {
				if (archives[j].date == date) {
					has = true;
					break;
				}
			}

			if (!has) {
				archives.push({
					date: date,
					month: articles[i].date.getMonth() + 1,
					year: articles[i].date.getFullYear()
				});
			}
		}
		callback(err, archives);
	})
}

//新增
var imageDir = "";								//当前文章图片目录

//提交验证，返回错误信息
function postVerification(req) {
	var err = "";
	if (!req.body.title) err += 'Missing title.';
	if (!req.body.tags) err += 'Missing tags.';
	if (!req.body.hidden) err += 'Missing hidden.';
	return err;
}

//初始化提交环境，重置图片目录
ArticleDAO.prototype.InitPostEnvir = function() {
	imageDir = "";
}

//新增文章-提交
ArticleDAO.prototype.AddPost = function(req, callback){
	var err = postVerification(req);
	if (err) {
		callback(err);
		return;
	}

	Article.findOne({'title': req.body.title}, 'title', function(err, article){
		if (err) {
			callback(err);
			return;
		}

		if (article) {
			callback('Article title exist.');
			return;
		}

		if (!req.files.htmlFile.path) {
			callback('Upload file missing.');
			return;
		}

		var htmlContent = fs.readFileSync(req.files.htmlFile.path, "utf8");

		var newArticle = new Article({
			title : req.body.title,
			tags : req.body.tags,
			date : (req.body.date && req.body.date.length !== 0) ? req.body.date : new Date(),
			hidden : req.body.hidden,
			oriContent : toMarkdown(htmlContent),
			content : htmlContent,
			dir : './app/public/images/'+guid.create()
		});

		newArticle.save(function(err){
			callback(err);
		});
	});
}

//新增文章-撰写
ArticleDAO.prototype.AddWrite = function(req, callback) {
	var err = postVerification(req);
	if (err) {
		callback(err);
		return;
	}

	Article.findOne({'title': req.body.title}, 'title', function(err, article){
		if (err) {
			callback(err);
			return;
		}
		
		if (article) {
			callback('Article title exist.');
			return;
		}
		
		if (!imageDir) {
			imageDir = './app/public/images/'+guid.create();
		}

		var newArticle = new Article({
			title : req.body.title,
			tags : req.body.tags,
			date : (req.body.date && req.body.date.length !== 0) ? req.body.date : new Date(),
			hidden : req.body.hidden,
			oriContent : req.body.content,
			content : markdown.toHTML(req.body.content),
			dir : imageDir
		});

		newArticle.save(function(err){
			if (!err) {
				imageDir = "";
			}
			callback(err);
		});
	});
}

//保存图片
ArticleDAO.prototype.SaveImage = function(req, callback) {
	var image = req.files.image;
	var contentType = image.type.split('/')[0];

	if (contentType != 'image') {
		callback('Not an image.');
		return;
	}

	if (!imageDir) {
		imageDir = './app/public/images/'+guid.create();
	}

	var imagePath = imageDir+'/'+image.name;

	if (!fs.existsSync(imageDir)){
		fs.mkdirSync(imageDir);
	}

	var is = fs.createReadStream(image.path);
	var os = fs.createWriteStream(imagePath);


	is.pipe(os);
    is.on('end', function(err) {
        fs.unlink(image.path, function() {
            if (err) {
            	callback(err);
            } else {
            	callback(err, imagePath);
            }
        });
    });
}

//删除文章
ArticleDAO.prototype.Delete = function(req, callback){
	Article.findOne({title: req.params.title}, function(err, article){
		if (fs.existsSync(article.dir)) {
			deleteFolderRecursive(article.dir);
		}
		Article.remove({title: req.params.title}, function(err){
			callback(err);
		});
	})
}

//删除目录及其下所有内容
function deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

//修改
var articleID = "";								//当前修改的文章id

//获取用于编辑的文章数据
ArticleDAO.prototype.getArticleData = function(req, callback) {
	var title = req.params.title;
	Article.findOne({'title': title}, function(err, article){
		imageDir = article.dir;
		articleID = article._id;
		callback(err, article);
	});
}

//更新编辑后的文章
ArticleDAO.prototype.updateArticleData = function(req, callback) {
	var err = postVerification(req);
	if (err) {
		callback(err);
		return;
	}

	if (!articleID) {
		callback('articleID missing.');
		return;
	}

	Article.findOne({'title': req.body.title}, 'title', function(err, article){
		if (err) {
			callback(err);
			return;
		}

		if (article) {
			if (article._id.toString() != articleID.toString()) {
				callback('Article title conflict.');
				return;
			}
		}

		Article.findByIdAndUpdate(articleID, {
			title : req.body.title,
			date : (req.body.date && req.body.date.length !== 0) ? req.body.date : new Date(),
			tags : req.body.tags,
			hidden : req.body.hidden,
			oriContent : req.body.content,
			content : markdown.toHTML(req.body.content)
		}, {}, function(err) {
			callback(err);
			return;
		});
	});
}

//删除无效的图片及目录
ArticleDAO.prototype.DeleteUselessDir = function(callback) {
	var dirList = [];
	var imgdir = './app/public/images/';
	var files = fs.readdirSync(imgdir);

	files.forEach(function(file) {
		var pathname = imgdir+file;
		if (fs.lstatSync(pathname).isDirectory()) {
			dirList.push(pathname);
		}
	});

	Article.find({}, 'dir').exec(function(err, articles) {
		if (err) {
			callback(err);
			return;
		}

		dirList.forEach(function(dir) {
			var has = false;

			for (var i = 0; i < articles.length; i++) {
				if (articles[i].dir == dir) {
					has = true;
					break;
				}
			}

			if (!has) {
				deleteFolderRecursive(dir);
			}
		});

		callback(err);
	});
}