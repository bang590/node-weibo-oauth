//need express and ejs
var express = require('express'),
	sinaOAuth = require('../lib/sinaOAuth'),
	app = express.createServer();

app.use(express.logger({ format: ':method :url :status' }));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'bang590' }));
app.use(app.router);

app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.error(function(err, req, res){
	console.log("500:" + err + " file:" + req.url)
	res.render('500');
});

app.set('views', __dirname + '/views');
app.register('.html', require('ejs'));
app.set('view engine', 'html');
app.set('view options', {layout: false})


app.get('/', function(req, res){
	res.render('index.html');
});

app.get('/oauth', function(req, res){
	var sinaoauth = new sinaOAuth();
	sinaoauth.oAuth(req, res, function(error, access_key, access_secret) {
		res.cookie("access_key", access_key);
		res.cookie("access_secret", access_secret);
		res.render('oauth.html');
	});
});

app.get('/test', function(req, res) {
	var sinaoauth = new sinaOAuth(req.cookies.access_key, req.cookies.access_secret);
	sinaoauth.friends_timeline({}, function(err, data) {
		if (err) return console.log(err);
		res.render('test.html', {statuses: JSON.parse(data)});
	});
});

app.post('/test', function(req, res) {
	var sinaoauth = new sinaOAuth(req.cookies.access_key, req.cookies.access_secret);
	sinaoauth.update({status : req.body.status}, function(err, data){
		if (err) return console.log(err);
		res.redirect('./test');
	});
});

app.listen(8080);
