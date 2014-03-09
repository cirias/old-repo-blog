var blog = require('./../models/blog.js');
exports.add = function(req, res){
	if(req.params.name){//update
		return res.render('blog', {
			title:req.params.name+'|博客|管理|blog.me',
			label:'编辑博客:'+req.params.name,
			blog:req.params.name
		});
	} else {
		return res.render('blog',{
			title:'新增加|博客|管理|blog.me',
			label:'新增加博客',
			blog:false
	});}
};

exports.doAdd = function(req, res) {
	console.log(req.body.content);
	var json = req.body.content;

	if(json._id){//update
	} else {//insert
		blog.save(json, function(err){
			if(err) {
				res.send({'success':false,'err':err});
			} else {
				res.send({'success':true});
			}
		});
	}
}

exports.JSON = function(req, res) {
	blog.findByName(req.params.title,function(err, obj){
		res.send(obj);
	});
}