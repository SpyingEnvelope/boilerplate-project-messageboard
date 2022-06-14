const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const conn = require('./db')

// Create the schema for replies
const replySchema = new Schema({
    'text': String,
    'created_on': {type: Date, default: Date.now, required: true},
    'delete_password': String,
    'reported': Boolean
})


// Create the schema for new threads
const threadSchema = new Schema({
    'text': String,
    'board': String,
    'created_on': {type: Date, default: Date.now, required: true},
    'bumped_on': {type: Date, default: Date.now, required: true},
    'reported': Boolean,
    'delete_password': String,
    'replies': [replySchema]
})


// Model for new threads
module.exports = mongoose.model('thread', threadSchema)