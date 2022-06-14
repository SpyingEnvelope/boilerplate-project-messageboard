const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const threadModel = require('../models/thread');
const conn = require("../models/db");

const getMultiThreads = async (req,res,next) => {

    let threadSearch = await threadModel
                                        .find({'board': req.params.board})
                                        .sort({'bumped_on': 'desc'})
                                        .select({'reported': 0, 'delete_password': 0, 'replies': {'reported': 0, 'delete_password': 0}})
                                        .limit(10)
    
    for (let i = 0; i < threadSearch.length; i++) {
        let repliesLength = threadSearch[i]['replies'].length;

        if (repliesLength > 3) {
            threadSearch[i].replies = [threadSearch[i]['replies'][repliesLength - 1], threadSearch[i]['replies'][repliesLength - 2], threadSearch[i]['replies'][repliesLength - 3]]
            continue
        }

        if (repliesLength < 3) {
            continue
        }
    }
    
    res.send(threadSearch)
}

const getSingleThread = async (req, res, next) => {
    console.log(req.query)

    if (req.query['thread_id'].length != 24) {
        return res.json({'error': 'thread_id must be exactly 24 characters long'})
    }
    
    let threadSearch = await threadModel
                                        .findOne({'_id': req.query['thread_id']}, {'replies.reported': 0, 'replies.delete_password': 0})
                                        .select('-reported -delete_password')
    
    if (threadSearch == null) {
        return res.json({'error': 'thread_id not found. Please check to make sure you have the correct 24 alphanumerical id'})
    }

    res.json(threadSearch)
}

module.exports = {getMultiThreads: getMultiThreads, getSingleThread: getSingleThread}