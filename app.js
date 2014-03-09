var express = require('express')
    , path = require('path')
    , ejs = require('ejs')
    , article = require('./routes/article')
    , user = require('./routes/user')
    , app = express()
//    , SessionStore = require("session-mongoose")(express)
    , server = require('http').createServer(app);

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '\\app\\views');
app.engine('.html', ejs.__express);
app.set('view engine', 'html'); //替换文件扩展名ejs为html
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('S3CRE7'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'app')));

if (app.get('env') === 'development') {
    app.use(express.errorHandler());
}

// 移动文件需要使用fs模块
// var fs = require('fs');
// app.post('/file-upload', function(req, res) {
//     // 获得文件的临时路径
//     var tmp_path = req.files.thumbnail.path;
//     // 指定文件上传后的目录 - 示例为"images"目录。
//     var target_path = './public/' + req.files.thumbnail.name;
//     // 移动文件
//     console.log('target_path: ' + target_path);
//     console.log('tmp_path: ' + tmp_path);

//     var fs = require('fs');
//     //var util = require('util');

//     var is = fs.createReadStream(tmp_path);
//     var os = fs.createWriteStream(target_path);

//     is.pipe(os);
//     is.on('end', function(err) {
//         console.log('It\'s END');
//         fs.unlink(tmp_path, function() {
//             if (err) throw err;
//             res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
//         });
//     });

//     // fs.rename(tmp_path, target_path, function(err) {
//     //     if (err) throw err;
//     //     // 删除临时文件夹文件,
//     //     fs.unlink(tmp_path, function() {
//     //         if (err) throw err;
//     //         res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
//     //     });
//     // });
// });

app.get('/',  article.home);
app.post('/', user.doSignin);
app.get('/post', article.post);//增加
app.post('/post', article.upload);//增加
app.post('/save', article.save);
app.post('/image/upload',article.uploadImage);
app.get('/signin', user.signin);
app.get('/:title', article.show);
app.get('/page/:no', article.home);
app.get('/tag/:tag', article.byTag);
app.get('/tag/:tag/:no', article.byTag);
app.get('/:title/delete', article.delete);
app.get('/:title/edit', article.edit);

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});