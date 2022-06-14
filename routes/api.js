'use strict';
const postController = require('../controllers/post')
const getController = require('../controllers/get')
const deleteController = require('../controllers/delete')
const putController = require('../controllers/put')

module.exports = function (app) {
  
  app.post('/api/threads/:board', postController.newThread);
    
  app.post('/api/replies/:board', postController.newReply);

  app.get('/api/threads/:board', getController.getMultiThreads)

  app.get('/api/replies/:board', getController.getSingleThread)

  app.delete('/api/threads/:board', deleteController.deleteThread)

  app.delete('/api/replies/:board', deleteController.deleteReply)

  app.put('/api/threads/:board', putController.reportThread)

  app.put('/api/replies/:board', putController.reportReply)

};
