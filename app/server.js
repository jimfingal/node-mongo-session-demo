var express = require('express'),
  https = require('https'),
  path = require('path'),
  request = require('request'),
  io = require('socket.io'),
  fs = require('fs'),
  crypto = require('crypto'),
  MongoStore = require('connect-mongo')(express);

var options = {
  key: fs.readFileSync('./app/keys/key.pem'),
  cert: fs.readFileSync('./app/keys/cert.pem')
};

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 
    'mongodb://localhost/session-test';

// One-off secret generation
var cookie_secret = crypto.createHash('sha1').update(new Date().getTime() + "").digest('hex');

var CLIENT_ID = process.env.INSTAGRAM_CLIENT_KEY;
var CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
// This must be redirect URL set with Instagram
var REDIRECT_URI = 'https://localhost:3000/oauthredirect';

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser(cookie_secret));
  app.use(express.session({
    secret: cookie_secret,
    store: new MongoStore({
        url: mongoUri
    })
  }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', function(req, res) {

  console.log(req.session['auth_response']);
  var auth_response = req.session['auth_response']

  if (auth_response && auth_response['access_token']) {

    res.render('code', { title: 'Oauth Response',
            username: auth_response['user']['username'],
            id: auth_response['user']['id'],
            profile_picture: auth_response['user']['profile_picture'],
            full_name: auth_response['user']['full_name']});

  } else {
    res.render('index', { title: 'Oauth Test' });
  }

});


app.get('/logout', function(req, res) {
  req.session.destroy(function() {
    res.render('index', { title: 'Oauth Test' });
  });
});

var server = https.createServer(options, app);
var serverio = io.listen(server).set('log level', 2);

app.get('/authenticate', function(req, res) {
  var url = "https://api.instagram.com/oauth/authorize/?client_id=" + 
                CLIENT_ID +
                "&redirect_uri=" + 
                REDIRECT_URI + 
                "&response_type=code";

  res.redirect(url);
});


app.get('/oauthredirect', function(req, res) {

  var code = req.query.code;

  if (code) {

    console.log("Code: " + code);

    var options = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
      code: code
    };

    var url = 'https://api.instagram.com/oauth/access_token';

    request.post(url, {form: options}, function (e, r, body) {
      
      var auth_response = JSON.parse(body);
      
      req.session['auth_response'] = auth_response;
      
      if (auth_response['error_type']) {
        res.render('code', { title: 'Oauth Response', 
            username: "Error",
            id: "Error",
            profile_picture: "Error",
            full_name: "Error"});
      } else {
        res.render('code', { title: 'Oauth Response',
            username: auth_response['user']['username'],
            id: auth_response['user']['id'],
            profile_picture: auth_response['user']['profile_picture'],
            full_name: auth_response['user']['full_name']
        });
      }

    });

  }

});


serverio.sockets.on('connection', function(socket) {  
  console.log("Connected to socket: " + socket);
});


server.listen(app.get('port'));
console.log('listening on port ' + app.get('port'));



