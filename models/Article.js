
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


var limition = 2;
var imageDir = "";
var articleID = "";

ArticleDAO.prototype.upload = function(req, callback){
	if (postVerification(req)) {
		callback(err);
		return;
	}

	Article.findOne({'title': req.body.title}, 'title', function(err, article){
		if (article) callback(new Error('Article title exist.'));
		else if (!req.files.htmlFile.path) callback(new Error('No uploaded file.'));
		else{
			var newArticle = new Article({
				title : req.body.title,
				tags : req.body.tags,
				hidden : req.body.hidden,
				content : fs.readFileSync(req.files.htmlFile.path, "utf8"),
				dir : "/public/images/" + Date.now() + req.body.title
			});

			newArticle.save(function(err){
				callback(err);
			});
		}
	});
}

ArticleDAO.prototype.selectArticle = function(req, callback){
	var title = req.params.title;
	var contents = "";
	Article.findOne({'title': title}, function(err, article){
		callback(article, err);
	});
}

ArticleDAO.prototype.selectArticlesByNo = function(req, callback){
	var no = req.params.no;
	no = typeof no !== 'undefined' ? no : 0;
	var contents = "";
	Article.find({}).sort({date: '-1'}).skip(no * limition).limit(limition).exec(function(err, articles){
		Article.count({}).exec(function(err, count){
			callback(articles, Math.ceil(count/limition), err);
		});
	});
}

ArticleDAO.prototype.selectArticlesByTag = function(req, callback){
	var no = req.params.no;
	var tag = req.params.tag;
	no = typeof no !== 'undefined' ? no : 0;
	var contents = "";
	Article.find({tags: tag}).sort({date: '-1'}).skip(no * limition).limit(limition).exec(function(err, articles){
		Article.count({tags: tag}).exec(function(err, count){
			callback(articles, Math.ceil(count/limition), err);
		});
	});
}

ArticleDAO.prototype.delete = function(req, callback){
	Article.findOne({title: req.params.title}, function(err, article){
		if (fs.existsSync(article.dir)) {
			deleteFolderRecursive(article.dir);
		}
		Article.remove({title: req.params.title}, function(err){
			callback(err);
		});
	})
}

ArticleDAO.prototype.initPostData = function() {
	imageDir = "";
}

ArticleDAO.prototype.uploadImage = function(req, callback) {
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

ArticleDAO.prototype.save = function(req, callback) {
	if (postVerification(req)) {
		callback(err);
		return;
	}

	Article.findOne({'title': req.body.title}, 'title', function(err, article){
		if (article) callback(new Error('Article title exist.'));
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

ArticleDAO.prototype.getArticleData = function(req) {
	var title = req.params.title;
	Article.findOne({'title': title}, function(err, article){
		imageDir = article.dir;
		articleID = article._id;
		return article;
	});
}

function postVerification(req) {
	var err = "";
	if (!req.body.title) err += 'Missing title.';
	if (!req.body.tags) err += 'Missing tags.';
	if (!req.body.hidden) err += 'Missing hidden.';
	return err;
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
};