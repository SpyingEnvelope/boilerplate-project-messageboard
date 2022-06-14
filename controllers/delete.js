const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const threadModel = require('../models/thread');
const conn = require("../models/db");
const bcrypt = require("bcrypt");

const deleteThread = async (req, res, next) => {
    // console log the request
    console.log('<==========================================================================>')
    console.log('Delete request received')
    console.log(req.body)
    console.log('<==========================================================================>')

    if (req.body['thread_id'].length != 24) {
        return res.send('thread_id must be exactly 24 characters long')
    };

    // find the thread by id
    let findThread = await threadModel.findById(req.body['thread_id'])

    // ensure the correct board was inserted
    if (findThread.board != req.body.board) {
        return res.send('Invalid board name. Please ensure you entered the correct board name (it is case sensitive)')
    }

    // compare the passwords using bcrypt
    let passwordReturn = await bcrypt.compare(req.body['delete_password'], findThread['delete_password'])

    // respond with incorrect password if compare fails
    if (!passwordReturn) {
        return res.send('incorrect password')
    }

    // delete the thread
    let threadDeletion = await threadModel.findByIdAndDelete(req.body['thread_id'])
                                                            .then(response => {
                                                                return 'success'
                                                            })
                                                            .catch(e => {
                                                                console.log(`**************** THREAD ID ${req.body['thread_id']} FAILED TO DELETE ***********************************`)
                                                                console.log(e)
                                                                return e
                                                            })
    
    // respond if the deletion was successful or if there was an error
    if (threadDeletion == 'success') {
        console.log(`**************** THREAD ID ${req.body['thread_id']} DELETED ***********************************`)
        return res.send(threadDeletion)
    }

    if (threadDeletion != 'success') {
        return res.send('error encountered while attempting to delete thread. Please try again later')
    }
}

const deleteReply = async (req, res, next) => {

    // console log the request
    console.log('<==========================================================================>')
    console.log('Delete request for a reply received')
    console.log(req.body)
    console.log('<==========================================================================>')

    // check that the id is 24 characters long
    if (req.body['thread_id'].length != 24 | req.body['reply_id'].length != 24) {
        return res.send('thread_id and reply_id must be exactly 24 characters long')
    }

    // find the thread by id and then the reply by id
    let replyFind = await threadModel.findById(req.body['thread_id']).then(async (thread) => {

        const reply = thread.replies.id(req.body['reply_id'])

        if (reply == null) {
            return 'reply not found'
        }

        // compare passwords
        let passwordReturn = await bcrypt.compare(req.body['delete_password'], reply['delete_password'])

        // respond with incorrect password if password compare fails
        if (!passwordReturn) {
            return 'incorrect password'
        }

        // set reply text to deleted and save
        reply.set({'text': '[deleted]'})

        return await thread.save()
    }).catch(e => {
        console.log(e)
        return e
    })

    console.log(replyFind)

    // respond approprietly
    if (replyFind == 'incorrect password') {
        return res.send(replyFind)
    }

    if (replyFind == 'reply not found'){
        return res.send(replyFind)
    }

    console.log(`**************** REPLY ID ${req.body['reply_id']} DELETED ***********************************`)
    res.send('success')
}

module.exports = {deleteThread: deleteThread, deleteReply: deleteReply}