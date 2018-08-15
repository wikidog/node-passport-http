const fse = require('fs-extra');
const path = require('path');
const axios = require('axios');

const debug = require('debug')('myapi:irs');
const logger = require('../../services/logger');

const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');

// middleware that is specific to this router
router.use(auth.ensureAuthenticated);

// routes
//
router.get('/me', (req, res) => {
  res.json(req.user);
});

//
router.get('/:irID/files', (req, res, next) => {
  let fileList = {
    noexport: [],
    export: [],
  };

  let irID = req.params.irID;

  if (isNaN(irID) || !/^\d{7}$/.test(irID)) {
    logger.error('Invalid IR number:[%s]', irID);
    res.status(404).json({ error: 'Not Found' });
    return; // exit this handler
  }

  Promise.all([getFileListNoexp(irID), getFileListExp(irID)])
    .then(results => {
      debug('Async call results: %O', results);
      fileList.noexport = results[0];
      fileList.export = results[1];
      res.json(fileList);
    })
    .catch(err => {
      debug('!!! Async call error: %O', err);
      next(err);
    });

  // getFileListNoexp()
  //   .then(files => {
  //     fileList.noexport = files;
  //     res.json(fileList);
  //   })
  //   .catch(err => {
  //     console.log('!!! Error: ', err);
  //     next(err); // send to error handler
  //   });

  // getFileListExp()
  //   .then(files => {
  //     fileList.export = files;
  //     res.json(fileList);
  //   })
  //   .catch(err => {
  //     console.log('!!! Error: ', err);
  //     next(err); // send to error handler
  //   });
});

const getFileListNoexp = async irID => {
  let result = [];

  const startPath = process.env.DATA_FILE_DIR;
  //
  const files = await fse.readdir(startPath);
  for (const file of files) {
    // console.log('irID:', irID);
    // console.log('file:', file);
    // console.log(file.startsWith(irID));
    const filename = path.join(startPath, file);
    if (file.startsWith(irID)) {
      const stat = await fse.stat(filename);
      if (stat.isFile()) {
        result.push(file);
        // console.log(stat);
      }
    }
  }
  return result;
};

const exportedUrl =
  'https://upload1.industrysoftware.automation.siemens.com/cgi-bin-ip/lsexp.cgi?ir=';
// TODO: finish the /exported api call
const getFileListExp = async irID => {
  // let result = await asyncCall();
  // return result;

  const res = await axios.get(`${exportedUrl}${irID}`);
  // console.log(res.data);
  return res.data;
};

const asyncCall = () => {
  let result = ['exp001.zip', 'exp002.zip', 'exp003.7z'];
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(result), 500);
  });
};

module.exports = router;
