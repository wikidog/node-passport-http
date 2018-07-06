const express = require('express');
const router = express.Router();

const irs = require('./irs');

router.use('/irs', irs);

module.exports = router;
