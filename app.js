var express = require('express')
    , path = require('path')
    , ejs = require('ejs')
    , article = require('./routes/article')
    , user = require('./routes/user')
    , admin = require('./routes/admin')
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

app.get('/',  article.home);
app.post('/', user.doSignin);
app.get('/post', article.post);//增加
app.post('/post', article.upload);//增加
app.get('/write', admin.write);
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