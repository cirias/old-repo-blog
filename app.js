var log4js = require('log4js');
log4js.configure({
	appenders: [
		{	type: 'console' },
		{
			type: 'file',
			filename: 'logs/access.log',
			maxLogSize: 1024,
			backup: 3,
			category: 'normal'
		}
	]
});
var logger = log4js.getLogger('normal');
logger.setLevel('INFO');

var express = require('express')
    , path = require('path')
    , ejs = require('ejs')
    , admin = require('./routes/admin')
    , everyone = require('./routes/everyone')
    , app = express()
    , server = require('http').createServer(app);
var session = require('express-session')
	, RedisStore = require('connect-redis')(session);


if (app.get('env') === 'production') {
	app.use(log4js.connectLogger(logger, {level: log4js.levels.INFO}));
	app.use(express.compress());
	app.use(function(req, res, callback) {
		res.removeHeader('X-Powered-By');
		callback();
	});

	app.use(express.cookieParser());
	app.use(express.session({
		key : 'sirius.sid',
		secret : 'flufy cat',
		store : new RedisStore(),
		cookie : {
			maxAge : 60000 * 60 * 24
		}
	}));
}

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/app/views');
app.engine('.html', ejs.__express);
app.set('view engine', 'html'); //替换文件扩展名ejs为html
app.use(express.favicon(__dirname + '/app/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

if (app.get('env') === 'development') {
	app.use(express.cookieParser());
	app.use(express.session({
		key : 'sirius.sid',
		secret : 'flufy cat',
		cookie : {
			maxAge : 60000 * 60 * 24
		}
	}));
}

app.use(app.router);
app.use(express.static(path.join(__dirname, 'app')));

if (app.get('env') === 'development') {
    app.use(express.errorHandler());
}

app.get('/',  everyone.getAllArticles);
app.get('/post', admin.getPost);
app.get('/write', admin.getWrite);
app.get('/signin', admin.getLogin);
app.get('/signout', admin.getLogout);
app.get('/clean', admin.getClean);
app.get('/:title', everyone.getAnArticle);
app.get('/page/:no', everyone.getAllArticles);
app.get('/tag/:tag', everyone.getTagArticles);
app.get('/tag/:tag/:no', everyone.getTagArticles);
app.get('/:title/delete', admin.getDelete);
app.get('/:title/edit', admin.getEdit);
app.get('/archive/:year/:month', everyone.getArchiveArticles);
app.get('/archive/:year/:month/:no', everyone.getArchiveArticles);

app.post('/', admin.postLogin);
app.post('/post', admin.postPost);
app.post('/write', admin.postWrite);
app.post('/edit', admin.postEdit);
app.post('/image/upload',admin.postImage);

if (process.env.NODE_ENV == 'production') {
	app.get('*', everyone.notfound);
}

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});