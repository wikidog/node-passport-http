const express = require('express');
const router = express.Router();

// routes
//
router.get('/', (req, res) => {
  res.send('Welcome!!!');
});

module.exports = router;
