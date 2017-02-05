const express = require('express');
const router = express.Router();

// required for the get-meta page
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// required for header data parser
const extractHeaderData = require('../lib/extractHeaderData.js');
// required for image search
const getJSON = require('../lib/getJSON.js');
const cleanData = require('../lib/cleanData.js');
// required for url shortener
const validate = require('valid-url');
const jhash = require('jhash');

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

/* timestamp microservice */
router.get('/timestamp', (req, res) => {
  let d = new Date();
  res.render('index-timestamp', {
    url1: '//'+req.get('Host')+'/timestamp/'+d.toDateString(),
    url2: '//'+req.get('Host')+'/timestamp/'+Math.floor(d.getTime()/1000),
    unix: Math.floor(d.getTime()/1000),
    natural: d.toDateString(),
  });
});

router.get('/timestamp/:data', (req, res) => {
  if (isNaN(Number.parseInt(req.params.data))) {
    if (isNaN(Date.parse(req.params.data))) {
      // neither date nor number parsed
      res.json({'unix': null, 'natural': null});
    } else {
      // date parsed
      let d = new Date(req.params.data);
      res.json({'unix': d.getTime()/1000, 'natural': d.toDateString()});
    }
  } else {
    // number parsed
    let n = new Date(req.params.data * 1000);
    res.json({'unix': req.params.data, 'natural': n.toDateString()});
  }
});

/* image search */
router.get('/image-search', (req, res, next) => {
  res.render('index-imagesearch', { title: 'FCC Image Search Abstraction' });
});

router.get('/image-search/api', (req, res, next) => {
  if (req.query.hasOwnProperty('q')) {
    try {
      req.db.collection('searchTerms').insertOne(
          { term: req.query.q,
            date: new Date()
          }, (err) => {
            // result omitted from function signature, not needed
            if (err) console.error(err);
          });
    } catch (e) {
      console.error(e);
    }

    let apiquery = 'https://www.googleapis.com/customsearch/v1?';
    apiquery += `key=${process.env.GOOGLE_CSE_APIKEY}&`;
    apiquery += `cx=${process.env.GOOGLE_CSE_CX}&`;
    apiquery += `searchType=image&q=${req.query.q}`;

    if (req.query.offset) {
      apiquery += `&start=${Math.min((req.query.offset - 1) * 10 + 1, 91)}`;
    }

    getJSON(apiquery, (answer) => {
      res.json(cleanData(answer.items));
    });
  } else {
    res.status(500).json({error: 'Must supply a query to get results'});
  }
});

/* /history */
router.get('/image-search/history', (req, res, next) => {
  try {
    // show last 10 items
    req.db.collection('searchTerms').find()
      .sort({date: -1})
      .limit(10)
      .toArray( (err, docs) => {
        if (err) res.json(err);
        res.json(docs);
      });
  } catch (e) {
    next(e)
  }
});

/* url shortener */
router.get('/url-short', function(req, res, next) {
  res.render('index-url',
      {
        title: 'FCC URL Shortener Microservice',
        hostname: req.protocol + '://' + req.hostname
      }
  );
});


router.get('/url-short/v1', function(req, res, next) {

  let validUrl = validate.isWebUri(req.query.longUrl);

  if (validUrl === undefined) {
    res.json({error: 'url is invalid', status: 400});
  } else {
    let hashUrl = jhash.hash(validUrl);
    try {
    req.db.collection('urlmap')
      .updateOne(
          { shortUrl: hashUrl},
          { shortUrl: hashUrl, longUrl: validUrl },
          { upsert: true },
        function(err, result) {
          if (err) console.error(err);
          console.log(`Inserted ${result.upsertedCount} document`);
        });
    } catch (tce) {
      console.error(tce);
    }

    res.json({ shortUrl: hashUrl, longUrl: validUrl, status: 200});
  }
});

/* GET short url and redirect. */
router.get('/url-short/*', function(req, res, next) {

  // req.originalUrl is the path with preceding / (no host)
  // retriev final path which is only shortUrl identifier
  let shortUrl = req.originalUrl.split('/');
  shortUrl = shortUrl[shortUrl.length - 1];

  try {
    req.db.collection('urlmap')
      .findOne({shortUrl: shortUrl}, function(err, result) {
        if (err) console.error('error:', err);
        if (result.hasOwnProperty('longUrl')) {
          res.redirect(301, result.longUrl);
        }
    });
  } catch (tcErr) {
    console.error(tcErr);
    next(tcErr);
  }
});


module.exports = router;
