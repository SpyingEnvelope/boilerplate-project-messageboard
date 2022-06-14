const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const threadModel = require('../models/thread');
const conn = require("../models/db");
const bcrypt = require("bcrypt");

const reportThread = async (req, res, next) => {

    if (req.body['thread_id'].length != 24) {
        return res.send('thread_id must be exactly 24 characters long')
    }

    const reportedThread = await threadModel.findById(req.body['thread_id']);

    if (reportedThread == null) {
        return res.send('thread_id does not exist. Please enter an existing thread_id')
    }

    if (reportedThread['board'] != req.body['board']) {
        res.send('board submitted does not match board name found. Please ensure you entered the correct on. It is case sensitive')
    }

    reportedThread.set({'reported': true});

    const saveResult = await reportedThread.save()
    
    console.log(saveResult)

    if (!saveResult['board']) {
        return res.send('error reporting thread. Please try again later')
    }

    res.send('reported');
}

const reportReply = async (req, res, next) => {
    console.log(req.body)

    if (req.body['thread_id'].length != 24 | req.body['reply_id'].length != 24) {
        return res.send('thread_id and reply_id must be exactly 24 characters long')
    }

    // find the thread by id and then the reply by id
    let replyFind = await threadModel.findById(req.body['thread_id']).then(async (thread) => {

        const reply = thread.replies.id(req.body['reply_id'])

        if (reply == null) {
            return 'reply not found'
        }

        // set reply reported value to true and save
        reply.set({'reported': true})

        return await thread.save()
    }).catch(e => {
        console.log(e)
        return 'error reporting reply'
    })

    // respond depending on what returns
    if (replyFind == 'reply not found') {
        res.send('reply_id not found. Please ensure you entered the correct id')
    }

    if (replyFind == 'error reporting reply') {
        return res.send('an error was encountered while attempting to report the reply. Please try again later')
    }

    res.send('reported')
}

module.exports = {reportThread: reportThread, reportReply: reportReply}