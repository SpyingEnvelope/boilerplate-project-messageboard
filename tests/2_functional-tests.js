const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { AssertionError } = require('chai');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    this.timeout(5000)
    let threadToDelete;
    let threadToPut;
    let chaiReplyId;

    //test #1
    test('Creating a new thread: POST request to /api/threads/{board}', done => {
        chai
            .request(server)
            .post('/api/threads/general')
            .send({
                'board': 'general',
                'text': 'This is a new thread that was created via chai',
                'delete_password': '1234'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(typeof res.body['id'], 'string');
                assert.equal(typeof res.body['delete_password'], 'string');
                threadToDelete = res.body['id'];
                done()
            })
    })

    //test #2
    test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', done => {
        chai
            .request(server)
            .get('/api/threads/general')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.length, 10);
                threadToPut = res.body[4]['_id']
                done()
            })
    })

    //test #3
    test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', done => {
        chai
            .request(server)
            .delete('/api/threads/general')
            .send({
                'board': 'general',
                'thread_id': threadToDelete,
                'delete_password': '123443r432'
            })
            .end((err, res) => {
                assert.equal(res.text, 'incorrect password');
                assert.equal(res.status, 200);
                done()
            })
    })

    //test #4
    test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', done => {
        chai
            .request(server)
            .delete('/api/threads/general')
            .send({
                'board': 'general',
                'thread_id': threadToDelete,
                'delete_password': '1234'
            })
            .end((err, res) => {
                assert.equal(res.text, 'success');
                assert.equal(res.status, 200);
                done()
            })
    })

    //test #5
    test('Reporting a thread: PUT request to /api/threads/{board}', done => {
        chai
            .request(server)
            .put('/api/threads/general')
            .send({
                'board': 'general',
                'thread_id': threadToPut
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'reported');
                done();
            })
    })

    //test #6
    test('Creating a new reply: POST request to /api/replies/{board}', done => {
        chai
            .request(server)
            .post('/api/replies/general')
            .send({
                'board': 'general',
                'thread_id': threadToPut,
                'text': 'This is a new reply that was generated via chai',
                'delete_password': '1234'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(typeof res.body['delete_password'], 'string');
                assert.equal(typeof res.body['reply_id'], 'string');
                assert.equal(res.body['board'], 'general');
                chaiReplyId = res.body['reply_id']
                done();
            })
    })

    //test #7
    test('Viewing a single thread with all replies: GET request to /api/replies/{board}', done => {
        chai
            .request(server)
            .get(`/api/replies/general?thread_id=${threadToPut}`)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body['_id'], threadToPut);
                done();
            })
    })

    //test #8
    test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', done => {
        chai
            .request(server)
            .delete('/api/replies/general')
            .send({
                'board': 'general',
                'thread_id': threadToPut,
                'reply_id': chaiReplyId,
                'delete_password': '12345678'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'incorrect password');
                done();
            })
    })

    //test #9
    test('Reporting a reply: PUT request to /api/replies/{board}', done => {
        chai
            .request(server)
            .put('/api/replies/general')
            .send({
                'board': 'general',
                'thread_id': threadToPut,
                'reply_id': chaiReplyId
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'reported');
                done();
            })
    })

    //test #10
    test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', done => {
        chai
            .request(server)
            .delete('/api/replies/general')
            .send({
                    'board': 'general',
                    'thread_id': threadToPut,
                    'reply_id': chaiReplyId,
                    'delete_password': '1234'
                })
            .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'success');
                    done();
                })
        })
});
