const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

// middleware that is specific to this router
router.use(auth.authStatus);

// routes
//
router.get('/logout', (req, res) => {
  req.logout(); // this function is provided by Passport
  res.redirect('/');
});

router.get('/status', (req, res) => {
  res.json(req.user);
});

module.exports = router;
