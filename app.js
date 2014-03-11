var express = require('express')
    , path = require('path')
    , ejs = require('ejs')
    , admin = require('./routes/admin')
    , everyone = require('./routes/everyone')
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

app.get('/',  everyone.getAllArticles);//----------
app.post('/', admin.postLogin);
app.get('/post', admin.getPost);//----------
app.post('/post', admin.postPost);//----------
app.get('/write', admin.getWrite);//----------
app.post('/save', admin.postWrite);
app.post('/image/upload',admin.postImage);
app.get('/signin', admin.getLogin);
app.get('/:title', everyone.getAnArticle);//----------
app.get('/page/:no', everyone.getAllArticles);//----------
app.get('/tag/:tag', everyone.getTagArticles);//----------
app.get('/tag/:tag/:no', everyone.getTagArticles);//----------
app.get('/:title/delete', admin.getDelete);//--------------
app.get('/:title/edit', admin.getEdit);//---------------------

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});