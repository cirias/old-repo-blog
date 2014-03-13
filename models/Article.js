var async = require('async');
var fs = require('fs');
var path = require('path');
var guid = require('./Guid');
var mongodb = require('./mongodb');
var markdown = require( "markdown" ).markdown;

var Schema = mongodb.mongoose.Schema;
var ArticleSchema = new Schema(
    {
        title : String,
        tags : [String],
        date : {type: Date, default: Date.now},
        dir : String,
        hidden : Boolean,
        content : String
    }
);
var Article = mongodb.mongoose.model("Article", ArticleSchema);
var ArticleDAO = function(){};
module.exports = new ArticleDAO();

//查询
var limition = 5;

ArticleDAO.prototype.GetPageNum = function(params, callback) {
	Article.count(params).exec(function(err, count){
		callback(err, Math.ceil(count/limition));
	});
}

ArticleDAO.prototype.SelectOne = function(req, callback){
	var title = req.params.title;

	Article.findOne({'title': title}, function(err, article){
		callback(err, article);
	});
}

ArticleDAO.prototype.SelectArray = function(req, params, callback) {
	var no = req.params.no;
	no = typeof no !== 'undefined' ? no : 0;

	Article.find(params).sort({date: '-1'}).skip(no * limition).limit(limition).exec(function(err, articles){
		callback(err, articles);
	});
}

//新增
var imageDir = "";

function postVerification(req) {
	var err = "";
	if (!req.body.title) err += 'Missing title.';
	if (!req.body.tags) err += 'Missing tags.';
	if (!req.body.hidden) err += 'Missing hidden.';
	return err;
}

ArticleDAO.prototype.InitPostEnvir = function() {
	imageDir = "";
}

ArticleDAO.prototype.AddPost = function(req, callback){
	var err = postVerification(req);
	if (err) {
		callback(err);
		return;
	}

	Article.findOne({'title': req.body.title}, 'title', function(err, article){
		if (article) callback('Article title exist.');
		else if (!req.files.htmlFile.path) callback('Upload file missing.');
		else{
			var newArticle = new Article({
				title : req.body.title,
				tags : req.body.tags,
				hidden : req.body.hidden,
				content : fs.readFileSync(req.files.htmlFile.path, "utf8"),
				dir : './app/public/images/'+guid.create()
			});

			newArticle.save(function(err){
				callback(err);
			});
		}
	});
}

ArticleDAO.prototype.AddWrite = function(req, callback) {
	var err = postVerification(req);
	if (err) {
		callback(err);
		return;
	}

	Article.findOne({'title': req.body.title}, 'title', function(err, article){
		if (article) callback('Article title exist.');
		else{
			console.log(markdown.toHTML(req.body.content));
			var newArticle = new Article({
				title : req.body.title,
				tags : req.body.tags,
				hidden : req.body.hidden,
				content : markdown.toHTML(req.body.content),
				dir : imageDir
			});

			newArticle.save(function(err){
				callback(err);
				imageDir = "";
			});
		}
	});
}

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
        console.log('It\'s END');
        fs.unlink(image.path, function() {
            if (err) {
            	callback(err);
            } else {
            	callback(err, imagePath);
            }
        });
    });
}

//删除
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
var articleID = "";

ArticleDAO.prototype.getArticleData = function(req, callback) {
	var title = req.params.title;
	Article.findOne({'title': title}, function(err, article){
		imageDir = article.dir;
		articleID = article._id;
		callback(err, article);
	});
}

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
		if (article) {
			callback('Article title exist.');
			return;
		}
		
		Article.findByIdAndUpdate(articleID, {
			title : req.body.title,
			tags : req.body.tags,
			hidden : req.body.hidden,
			content : markdown.toHTML(req.body.content)
		}, {}, function(err) {
			callback(err);
			return;
		});
	});
}
