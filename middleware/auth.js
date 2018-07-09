const passport = require('passport');
const debug = require('debug')('myapi:auth');

// // by default, passport tries to use session based authentication
// // we have to disable it - don't create session after successful authentication
// const requireAuth = passport.authenticate('jwt', { session: false });
// const requireSignin = passport.authenticate('local', { session: false });

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    debug('>>> User is authenticated: %s', req.user);
    return next();
  } else {
    debug('!!! User is NOT authenticated !!!!!!!!!!!!!');
    return passport.authenticate('basic')(req, res, next);
  }
};

const authStatus = (req, res, next) => {
  debug('Session data: %O', req.session);
  debug('Session ID: %s', req.sessionID);
  if (req.isAuthenticated()) {
    debug('>>> User is authenticated: %s', req.user);
  } else {
    debug('!!! User is NOT authenticated !!!!!!!!!!!!!');
  }

  return next();
};

module.exports = {
  ensureAuthenticated,
  authStatus,
};
