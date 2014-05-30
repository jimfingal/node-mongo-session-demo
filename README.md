node-mongo-session-demo
=============

A simple demo that allows a user to authenticate with Instagram, and stores that information in a session backed by MongoDB. The user can also log out, destroying the session and causing them to have to log in again.

For this to work, you must have a registered Instagram account, and the following environment variables:

    export INSTAGRAM_CLIENT_KEY=XXXXX
    export INSTAGRAM_CLIENT_SECRET=XXXX

And you must generate SSL keys via:

    ./keygen.sh

To run:

    node web.js

## Database

Requires MongoDB.

On OSX, you can get mongo with homebrew:

    brew install mongo

And start Mongod in the foreground with the following:

    mongod --config /usr/local/etc/mongod.conf


## Salient Tech Excerpts

The middleware used is mongo-connect:

```javascript
    MongoStore = require('connect-mongo')(express);
```

The Mongo URI is made to localhost, or (untested) configured to the Heroku environment variables:

```javascript
    var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/session-test';
```

A cookie secret is created:


```javascript
    var cookie_secret = crypto.createHash('sha1').update(new Date().getTime() + "").digest('hex');
```

Middleware connected:

```javascript
    app.use(express.cookieParser(cookie_secret));
    app.use(express.session({
      secret: cookie_secret,
      store: new MongoStore({
          url: mongoUri
      })
    }));
```

When the access token is retrieved it is set in the session:

```javascript
      req.session['auth_response'] = auth_response;
```

If we go back to the base page, we can consult the session to decide whetehr to go straight to the display page, or give the user an opportunity to log in again:

```javascript
  if (auth_response && auth_response['access_token']) {

    res.render('code', { title: 'Oauth Response',
            username: auth_response['user']['username'],
            id: auth_response['user']['id'],
            profile_picture: auth_response['user']['profile_picture'],
            full_name: auth_response['user']['full_name']});

  } else {
    res.render('index', { title: 'Oauth Test' });
  }
```

If we click the logout button, we destroy the session:

```javascript
  app.get('/logout', function(req, res) {
    req.session.destroy(function() {
      res.render('index', { title: 'Oauth Test' });
    });
  });
```



