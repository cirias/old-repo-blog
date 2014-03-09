var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var blogSchema = new Schema({
  title: String,
  articleDir: String,
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  tags: [String]
});
var blog = mongodb.mongoose.model("blog", blogSchema);
var blogDAO = function(){};
module.exports = new blogDAO();

blogDAO.prototype.save = function(obj, callback) {
	var instance = new blog(obj);
	instance.save(function(err){
		callback(err);
	});
};

blogDAO.prototype.findByName = function(title, callback) {
	blog.findOne({title:title}, function(err, obj){
		callback(err, obj);
	});
};