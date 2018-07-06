const passport = require('passport');
const Strategy = require('passport-http').BasicStrategy;

const ldap = require('ldapjs');

// 'user' is the user object
// serialize user and put it in the cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// after deserializeUser, we will have "req.user"
passport.deserializeUser((id, done) => {
  done(null, { id: id });
});

passport.use(
  new Strategy((username, password, done) => {
    console.log('username:', username);
    console.log('password:', password);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    if (process.env.NODE_ENV === 'development_external') {
      // simulation
      if (username === process.env.API_USERNAME) {
        return done(null, { id: username });
      }
      console.log(
        `!!!!! Only user "${process.env.API_USERNAME}" is allowed to log in...`
      );
      return done(null, false);
    } else {
      //
      // verify username and password with LDAP
      //
      const ldapClient = ldap.createClient({
        url: `ldaps://${process.env.AD_SERVER}`,
        tlsOptions: {
          requestCert: true,
          rejectUnauthorized: false,
        },
      });

      ldapClient.bind(`${process.env.DOMAIN}\\${username}`, password, err => {
        if (err) {
          console.log('!!!! LDAP error:', err);
          ldapClient.unbind(); // close the connection
          return done(null, false);
        } else {
          console.log('>>>> LDAP: user authenticated....');
          ldapClient.unbind(); // close the connection
          return done(null, { id: username });
        }
      });
    }
  })
);
