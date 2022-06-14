const mongoose = require('mongoose');
module.exports = mongoose.connect(process.env.URI_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true});
let conn = mongoose.connection;