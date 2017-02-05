const express = require('express');
const router = express.Router();

// required for the get-meta page
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// required for header data parser
const extractHeaderData = require('../lib/extractHeaderData.js');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'FCC Backend API Projects' });
});

/* GET file meta data api server */
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
router.get('/header-parser', (req, res, next) => {
  let d = extractHeaderData(req);
  d.title = 'FCC Request Header Parser on Express';
  d.url = '//' + req.get('host');
  res.render('index-headerparser', d);
});

router.get('/header-parser/json', (req, res, next) => {
  res.jsonp(extractHeaderData(req));
});


module.exports = router;
