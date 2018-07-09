const fse = require('fs-extra');
const path = require('path');
const debug = require('debug')('myapi:irs');

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
    res.status(404).json({ error: 'Not Found in route handler' });
    return; // exit this handler
  }

  Promise.all([getFileListNoexp(), getFileListExp()])
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

const getFileListNoexp = async () => {
  let result = [];

  const startPath = process.env.DATA_FILE_DIR;
  //
  const files = await fse.readdir(startPath);
  for (const file of files) {
    const filename = path.join(startPath, file);
    const stat = await fse.stat(filename);
    if (stat.isFile()) {
      result.push(file);
      // console.log(stat);
    }
  }
  return result;
};

// TODO: finish the /exported api call
const getFileListExp = async () => {
  let result = await asyncCall();
  return result;
};

const asyncCall = () => {
  let result = ['exp001.zip', 'exp002.zip', 'exp003.7z'];
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(result), 500);
  });
};

module.exports = router;
