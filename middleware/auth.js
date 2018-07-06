const passport = require('passport');

// // by default, passport tries to use session based authentication
// // we have to disable it - don't create session after successful authentication
// const requireAuth = passport.authenticate('jwt', { session: false });
// const requireSignin = passport.authenticate('local', { session: false });

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log('>>>>>>>>> User is authenticated <<<<<<<<<<');
    console.log('User: ', req.user);
    return next();
  } else {
    console.log('!!!!!!! User is NOT authenticated !!!!!!!!!!!!!');
    return passport.authenticate('basic')(req, res, next);
  }
};

const authStatus = (req, res, next) => {
  console.log('==== Session ====================');
  console.log(req.session);
  console.log('==== Session ID =================');
  console.log(req.sessionID);
  console.log('=================================');
  if (req.isAuthenticated()) {
    console.log('>>>>>>>>> User is authenticated <<<<<<<<<<');
    console.log('User: ', req.user);
  } else {
    console.log('!!!!!!! User is NOT authenticated !!!!!!!!!!!!!');
  }

  return next();
};

module.exports = {
  ensureAuthenticated,
  authStatus,
};
