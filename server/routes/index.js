var express = require('express');
var router = express.Router();

router.use((req, res, next) => {
  console.log(req.headers);
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  } 
});

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('test');
  console.log(req.headers);
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  }
  res.sendFile(path.join(__dirname + '/../client', 'build', 'index.html'))
});

module.exports = router;
