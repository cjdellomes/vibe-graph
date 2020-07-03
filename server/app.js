const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const enforce = require('express-sslify');
const redis = require('redis');

const RedisConnection = require('./RedisConnection');
const searchRouter = require('./routes/search');
const relatedArtistsRouter = require('./routes/relatedArtists');

const app = express();
const redisConnection = new RedisConnection(
  redis,
  process.env.REDIS_URL || 'redis://localhost:6379',
);
app.set('cacheConnected', false);
app.set('cache', redisConnection);
redisConnection.connectApp(app);

if (process.env.NODE_ENV === 'production') {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(`${__dirname}/../client`, 'build')));

app.use(cors());

app.use('/search', searchRouter);
app.use('/related-artists', relatedArtistsRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;
