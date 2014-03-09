var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var TagSchema = new Schema(
    {
        name : String,
        hidden : {type: Boolean, default: 'TRUE'}
    }
);

var Tag = mongodb.mongoose.model('Tag', TagSchema);
var TagDAO = function(){};
module.exports = new TagDAO();

TagDAO.prototype.selectAll = function(callback){
	Tag.find({}).exec(function(err, tags){
		callback(err, tags);
	});
}

TagDAO.prototype.save = function(tags, callback){
	if (typeof tags != 'string')
		for (var i in tags) saveUnexistTag(tags[i], callback);
	else saveUnexistTag(tags, callback);
}

function saveUnexistTag(tag, callback){
	Tag.findOne({name: tag}, 'name', function(err, existTag){
		if (existTag){}
		else{
			newTag = new Tag({name: tag});
			newTag.save();
		}

		callback(err);
	});
}