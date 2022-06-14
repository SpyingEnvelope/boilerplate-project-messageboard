const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const conn = require("../models/db")
const threadModel = require('../models/thread')
const bcrypt = require('bcrypt')

// // Connect to mongoose
mongoose.connect(process.env.URI_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true})

// // Create the schema for replies
// const replySchema = new Schema({
//     'text': String,
//     'created_on': {type: Date, default: Date.now, required: true},
//     'delete_password': String,
//     'reported': Boolean
// })


// // Create the schema for new threads
// const threadSchema = new Schema({
//     'text': String,
//     'board': String,
//     'created_on': {type: Date, default: Date.now, required: true},
//     'bumped_on': {type: Date, default: Date.now, required: true},
//     'reported': Boolean,
//     'delete_password': String,
//     'replies': [replySchema]
// })


// // Model for new threads
// const threadModel = mongoose.model('thread', threadSchema)

const newThread = async (req,res,next) => {
    console.log(req.body)

    // Hash the delete password before storing
    let hashedPassword = await bcrypt.hash(req.body['delete_password'], 10);

    // Create and save new thread
    const newThread = await new threadModel({
        'text': req.body.text,
        'board': req.body.board,
        'created_on': Date.now(),
        'bumped_on': Date.now(),
        'reported': false,
        'delete_password': hashedPassword,
        'replies': []
    }).save().catch(e => {
        console.log(e)
        return e
    })

    console.log(newThread);

    // Respond with JSON
    res.json({
        'text': newThread.text,
        'board': newThread.board,
        'created_on': newThread['created_on'],
        'delete_password': req.body['delete_password'],
        'id': newThread['_id']
    })
}

const newReply = async (req,res,next) => {
    console.log(req.body['thread_id'].length)

    // if thread_id is not 24 characters long, respond with error
    if (req.body['thread_id'].length != 24) {
        return res.json({'error': 'thread_id must be 24 characters long'})
    }

    // Hash password before storing it
    let hashedPassword = await bcrypt.hash(req.body['delete_password'], 10);

    // New reply to be stored in the replies array of the thread
    let newReply = {
        'text': req.body.text,
        'created_on': Date.now(),
        'delete_password': hashedPassword,
        'reported': false
    }

    // The info to update
    let updatedInfo = {
        'bumped_on': Date.now(),
        $push: {'replies': newReply}
    }

    const addReply = await threadModel.findOneAndUpdate({'_id': req.body['thread_id']}, updatedInfo)

    // If the id was not found in the database, respond with wrong id
    if (addReply == null) {
        return res.json({'error': 'thread_id not found. Please ensure you entered the correct thread_id'})
    }

    const replyId = await threadModel.findOne({'_id': req.body['thread_id']})

    // Respond with JSON
    res.json({
        'thread_id': addReply['_id'],
        'reply_id': replyId.replies[replyId['replies'].length - 1]['_id'],
        'text': replyId.replies[replyId['replies'].length - 1]['text'],
        'board': addReply.board,
        'delete_password': req.body['delete_password'],
        'created_on': replyId.replies[replyId['replies'].length - 1]['created_on']
    })
}

module.exports = {newThread: newThread, newReply: newReply}