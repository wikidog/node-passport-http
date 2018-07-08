const fse = require('fs-extra');
const path = require('path');

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

  console.log('irID: ', irID);

  if (isNaN(irID) || !/^\d{7}$/.test(irID)) {
    res.status(404).json({ error: 'Not Found in route handler' });
    return; // exit this handler
  }

  get_file_list_noexp()
    .then(files => {
      fileList.noexport = files;
      res.json(fileList);
    })
    .catch(err => {
      console.log('!!! Error: ', err);
      next(err); // send to error handler
    });

  // const startPath = process.env.DATA_FILE_DIR;
  // fs.readdir(startPath, (err, files) => {
  //   console.log(files);
  //   files.forEach(file => {
  //     const filename = path.join(startPath, file);
  //     const stat = fs.statSync(filename);
  //     if (stat.isFile()) {
  //       fileList.noexport.push(file);
  //       console.log(filename);
  //       // console.log(stat);
  //     }
  //   });
  //   res.json(fileList);
  // });

  // res.json({ irID: irID });
  // return;
});

function get_file_list() {}

async function get_file_list_noexp() {
  let result = [];

  const startPath = process.env.DATA_FILE_DIR;
  //
  const files = await fse.readdir(startPath);
  for (const file of files) {
    const filename = path.join(startPath, file);
    const stat = await fse.stat(filename);
    if (stat.isFile()) {
      result.push(file);
      console.log(filename);
      // console.log(stat);
    }
  }
  return result;
}

function get_file_list_exp() {}

module.exports = router;
