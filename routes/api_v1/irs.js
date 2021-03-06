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
    exported: [],
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
      fileList.exported = results[1];
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
  const dir = `${startPath}/${irID.substr(0, 4)}/${irID}/external_data`;

  //! the 'dir' might not exist
  try {
    const files = await fse.readdir(dir);
    for (const file of files) {
      const filename = path.join(dir, file);
      if (file.startsWith(irID)) {
        const stat = await fse.stat(filename);
        if (stat.isFile()) {
          result.push(file);
        }
      }
    }
    return result;
  } catch (e) {
    return result;
  }
};

const exportedUrl =
  'https://upload1.industrysoftware.automation.siemens.com/cgi-bin-ip/lsexp.cgi?ir=';
const getFileListExp = async irID => {
  const res = await axios.get(`${exportedUrl}${irID}`);
  return res.data;
};

const asyncCall = () => {
  let result = ['exp001.zip', 'exp002.zip', 'exp003.7z'];
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(result), 500);
  });
};

module.exports = router;
