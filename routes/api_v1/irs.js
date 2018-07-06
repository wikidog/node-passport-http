const fs = require('fs'); // Node file system module
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

router.get('/private', (req, res) => {
  res.send({ message: 'secret code 123456' });
});

//
router.get('/dir', (req, res) => {
  let fileList = {
    noexport: [],
    export: [],
  };

  fs.access('./sessions', fs.constants.R_OK | fs.constants.W_OK, err => {
    if (err) {
      console.log('./sessions: no access');
      res.send({ message: 'no access' });
    } else {
      console.log('./sessions: access for read/write');
      //res.send({ message: 'access for read/write' });
      res.json(fileList);
    }
  });
});

//
router.get('/:irID/files', (req, res) => {
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

  const startPath = process.env.DATA_FILE_DIR;
  fs.readdir(startPath, (err, files) => {
    console.log(files);
    files.forEach(file => {
      const filename = path.join(startPath, file);
      const stat = fs.statSync(filename);
      if (stat.isFile()) {
        fileList.noexport.push(file);
        console.log(filename);
        // console.log(stat);
      }
    });
    res.json(fileList);
  });

  // res.json({ irID: irID });
  // return;

  // fs.access('./sessions', fs.constants.R_OK | fs.constants.W_OK, err => {
  //   if (err) {
  //     console.log('./sessions: no access');
  //     res.send({ message: 'no access' });
  //   } else {
  //     console.log('./sessions: access for read/write');
  //     //res.send({ message: 'access for read/write' });
  //     res.json(fileList);
  //   }
  // });
});

module.exports = router;

// module.exports = app => {
//   app.get('/api/current_user', auth.authStatus, (req, res) => {
//     res.send(req.user);
//   });

//   app.get('/api/logout', (req, res) => {
//     req.logout(); // this function is provided by Passport
//     res.redirect('/');
//   });

//   app.get('/', (req, res) => {
//     res.send({ message: 'secret code 123456' });
//   });

//   app.get('/api/me', auth.ensureAuthenticated, (req, res) => {
//     res.json(req.user);
//   });
// };
