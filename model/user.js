let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let user = new Schema({
    "user_id": Number,
    "netmusic_info": Object
});
module.exports = mongoose.model('user', user);