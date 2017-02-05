var express = require('express');
var router = express.Router();

// required for the get-meta page
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'FCC Backend API Projects' });
});

router.get('/file-metadata', (req, res, next) => {
  res.render('index-filemeta', { title: 'FCC File MetaData' });
});

/* GET META page. */
router.post('/file-metadata/get-meta', upload.single('testfile'),
    (req, res, next) => {
  let metaData = {};
  metaData.size = req.file.size;
  metaData.name = req.file.originalname;
  metaData.type = req.file.mimetype;
  res.json(metaData);
});

/* header parser */

module.exports = router;
