//
// index.js is the Main starting point of the application
//

// load dotenv as early as possible
// only used in dev environment
require('dotenv').config();

// debugging
const debug = require('debug')('myapi:index');

// logger
const morgan = require('morgan');
const logger = require('./services/logger');

//
const express = require('express');
const createError = require('http-errors');
//const bodyParser = require('body-parser'); // use the built-in express.json
// const cookieSession = require('cookie-session');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
// const cors = require('cors');

// routes
const apiV1Router = require('./routes/api_v1');
const userRouter = require('./routes/user');
const homeRouter = require('./routes/home');
// ===================================================================

debug('NODE_ENV: %s', process.env.NODE_ENV);

// Passport configuration first
//
require('./services/passport');

// configure Express
//
const app = express();

// use winston to log morgan's log
app.use(morgan('combined', { stream: { write: msg => logger.info(msg) } }));

// allow CORS requests
//
// app.use(cors());

// body-parser: parse request bodies, available under the req.body property
//              json({type: '*/*'}) - parse as JSON for any request
//app.use(bodyParser.json({ type: '*/*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ---------------------------------------------------------------------
// Session
//
// First: we have to let cookie middleware decrypt the cookie, if user
//        sends us a cookie (cookie is encrypted).
// app.use(
//   cookieSession({
//     name: process.env.COOKIE_NAME,
//     maxAge: 12 * 60 * 60 * 1000, // 12 hours
//     keys: [process.env.COOKIE_KEY], // cookie is encrypted
//     // proxy: true,
//   })
// );
const sess = {
  store: new FileStore(),
  name: process.env.COOKIE_NAME,
  secret: process.env.COOKIE_KEY, // cookie is encrypted
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: Number(process.env.COOKIE_MAXAGE),
  },
};

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
  app.set('trust proxy', true);
  // app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

debug('session options: %O', sess);

app.use(session(sess));

// this is required to initialize Passport
app.use(passport.initialize());
// Second: tell Passport to use cookie and create session
app.use(passport.session());
// ---------------------------------------------------------------------

// for debugging
if (debug.enabled) {
  app.use((req, res, next) => {
    debug('request headers: %O', req.headers);
    next();
  });
}

// App routes
//
// require('./routes/auth')(app);
app.use('/api/v1', apiV1Router);
app.use('/user', userRouter);
app.use('/', homeRouter);

// catch 404 and forward to error handler
//   404 responses are not the result of an error,
//   so the error-handler middleware will not capture them
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler middleware - catch all the errors here
app.use((err, req, res, next) => {
  // console.log('*** error handling middleware ***', err);
  logger.error(
    '[Error Handler] %s - %s - %s',
    req.method,
    req.path,
    err.message
  );
  res.status(422).send({ error: 'Unprocessable Entity' });
});

// ---------------------------------------------------------------------

// Server Setup
const port = process.env.PORT || 5000;
// const server = http.createServer(app);
// server.listen(port);
// console.log(`Server running at http://localhost:${port}/`);
app.listen(port, () =>
  logger.info(`Server running at http://localhost:${port}/`)
);
