const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const config = require('./config');

const connect = mongoose.connect(
  config.database,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
  }
);
module.exports = connect;
