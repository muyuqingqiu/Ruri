let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let group = new Schema({
    "group_id": Number,
    "qanda": Object
});
module.exports = mongoose.model('group', group);