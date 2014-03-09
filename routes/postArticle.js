var fs = require('fs');
var AdmZip = require('adm-zip');

exports.upload = function(req, res){
	res.render('zip',{title:'zip test.'});
}

exports.doUpload = function(req, res){
	var zip = new AdmZip(req.files.zipfile.path);
	var zipEntries = zip.getEntries();
	var fileDir = './views/blogs/'+Date.now().toString().replace(" ","_")+"_"+req.files.zipfile.name.replace(".zip","");
	fs.mkdir(fileDir, function(err){
		if(err) throw err;
	});
	for (var i = 0; i < zipEntries.length; i++){
		fs.open(fileDir+'/'+zipEntries[i].name,"w",0644,function(err,fd){
		    if(err) throw err;
		    fs.write(fd,zip.readAsText(zipEntries[i]),0,'utf8',function(e){
		        if(err) throw err;
		        fs.closeSync(fd);
		    })
		});
        console.log(zipEntries[i].name + 'is unziped.');
	}

	res.send('zip……');
}