var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var UserSchema = new Schema({
	username: String,
	password: String,
	group: String
});

var User = mongodb.mongoose.model('User', UserSchema);
var UserDAO = function(){};
module.exports = new UserDAO();

UserDAO.prototype.signin = function(req, callback) {
	User.findOne({username: req.body.username}, 'username password group', function(err, user){
		callback(err, user && (user.password == req.body.password));
	})
};
