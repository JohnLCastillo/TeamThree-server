/* eslint-env mocha */
'use strict';
const {TEST_DATABASE_URL} = require('../config');
const chai = require('chai');
const chaiHttp = require('chai-http');
const {dbConnect, dbDisconnect} = require('../db-mongoose');
const {app, closeServer, runServer} = require('../server');
const {User} = require('../users');
const mongoose=require('mongoose');
const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('/api/user', function() {
	const username = 'exampleUser';
	const password = 'examplePass12';
	const firstName = 'Example';
	const lastName = 'User';
	const email = 'JoeSchmo@gmail.com';
	const bday = '6/6/66';
	const risk = [{
		'x': 0,
		'y': 5000
	}];
	const intro = false;
 
	before(function() {
		console.log('runServer for tests');
		return dbConnect(TEST_DATABASE_URL);
	});

	after(function() {
		console.log('closing server after tests');
		closeServer();
		return dbDisconnect(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		console.log('create new user');
		return User.hashPassword(password).then(password =>
			User.create({
				username,
				password,
				firstName,
				lastName,
				bday,
				email
			})
		);
	});

	afterEach(function () {
		console.log('remove user');
		return User.remove({username: 'exampleUser'});
	});


	describe('/api/users', function() {
		describe('POST', function() {
			it('Should reject users with missing username', function() {
				return chai
					.request(app)
					.post('/api/users')
					.send({
						password,
						firstName,
						lastName,
						email,
						bday
					})
					.then(res => {
						expect(res).to.have.status(422);
						expect(res.body.reason).to.equal('ValidationError');
						expect(res.body.message).to.equal('Missing field');
						expect(res.body.location).to.equal('username');
					})
					.catch(err => {
						if (err instanceof chai.AssertionError) {
							throw err;
						}
					});
			});
			it('Should reject users with missing password', function() {
				return chai
					.request(app)
					.post('/api/users')
					.send({
						username,
						firstName,
						lastName,
						email,
						bday
					})
					.then(res => {
						expect(res).to.have.status(422);
						expect(res.body.reason).to.equal('ValidationError');
						expect(res.body.message).to.equal('Missing field');
						expect(res.body.location).to.equal('password');
					})
					.catch(err => {
						if (err instanceof chai.AssertionError) {
							throw err;
						}
					});
			});
			it('Should reject users with non-string username', function() {
				return chai
					.request(app)
					.post('/api/users')
					.send({
						username: 1234,
						password,
						firstName,
						lastName,
						email,
						bday
					})
					.then(res => {
						expect(res).to.have.status(422);
						expect(res.body.reason).to.equal('ValidationError');
						expect(res.body.message).to.equal('Incorrect field type: expected string');
						expect(res.body.location).to.equal('username');
					})
					.catch(err => {
						if (err instanceof chai.AssertionError) {
							throw err;
						}
					});
			});
			it('Should reject users with non-string password', function() {
				return chai
					.request(app)
					.post('/api/users')
					.send({
						username,
						password: 1234,
						firstName,
						lastName,
						email,
						bday
					})
					.then(res => {
						expect(res).to.have.status(422);
						expect(res.body.reason).to.equal('ValidationError');
						expect(res.body.message).to.equal('Incorrect field type: expected string');
						expect(res.body.location).to.equal('password');
					})
					.catch(err => {
						if (err instanceof chai.AssertionError) {
							throw err;
						}
					});
			});
			it('Should reject users with non-string first name', function() {
				return chai
					.request(app)
					.post('/api/users')
					.send({
						username,
						password,
						firstName: 1234,
						lastName,
						email,
						bday
					})
					.then(res => {
						expect(res).to.have.status(422);
						expect(res.body.reason).to.equal('ValidationError');
						expect(res.body.message).to.equal(
							'Incorrect field type: expected string'
						);
						expect(res.body.location).to.equal('firstName');
					})
					.catch(err => {
						if (err instanceof chai.AssertionError) {
							throw err;
						}
					});
			});
			it('Should reject users with non-string last name', function() {
				return chai
					.request(app)
					.post('/api/users')
					.send({
						username,
						password,
						firstName,
						lastName: 1234,
						email,
						bday
					})
					.then(res => {
						expect(res).to.have.status(422);
						expect(res.body.reason).to.equal('ValidationError');
						expect(res.body.message).to.equal(
							'Incorrect field type: expected string'
						);
						expect(res.body.location).to.equal('lastName');
					})
					.catch(err => {
						if (err instanceof chai.AssertionError) {
							throw err;
						}
					});
			});
			it('Should reject users with non-trimmed username', function() {
				return chai
					.request(app)
					.post('/api/users')
					.send({
						username: ` ${username} `,
						password,
						firstName,
						lastName,
						email,
						bday
					})
					.then(res => {
						expect(res).to.have.status(422);
						expect(res.body.reason).to.equal('ValidationError');
						expect(res.body.message).to.equal(
							'Cannot start or end with whitespace'
						);
						expect(res.body.location).to.equal('username');
					})
					.catch(err => {
						if (err instanceof chai.AssertionError) {
							throw err;
						}
					});
			});
			it('Should reject users with non-trimmed password', function() {
				return chai
					.request(app)
					.post('/api/users')
					.send({
						username,
						password: ` ${password} `,
						firstName,
						lastName,
						email,
						bday
					})
					.then(res => {
						expect(res).to.have.status(422);
						expect(res.body.reason).to.equal('ValidationError');
						expect(res.body.message).to.equal(
							'Cannot start or end with whitespace'
						);
						expect(res.body.location).to.equal('password');
					})
					.catch(err => {
						if (err instanceof chai.AssertionError) {
							throw err;
						}
					});
			});
			it('Should reject users with empty username', function() {
				return chai
					.request(app)
					.post('/api/users')
					.send({
						username: '',
						password,
						firstName,
						lastName,
						email,
						bday
					})
					.then(res => {
						expect(res).to.have.status(422);
						expect(res.body.reason).to.equal('ValidationError');
						expect(res.body.message).to.equal(
							'Must be at least 1 characters long'
						);
						expect(res.body.location).to.equal('username');
					})
					.catch(err => {
						if (err instanceof chai.AssertionError) {
							throw err;
						}
					});
			});
			it('Should reject users with password less than ten characters', function() {
				return chai
					.request(app)
					.post('/api/users')
					.send({
						username,
						password: '123456789',
						firstName,
						lastName,
						email,
						bday
					})
					.then(res => {
						expect(res).to.have.status(422);
						expect(res.body.reason).to.equal('ValidationError');
						expect(res.body.message).to.equal(
							'Must be at least 10 characters long'
						);
						expect(res.body.location).to.equal('password');
					})
					.catch(err => {
						if (err instanceof chai.AssertionError) {
							throw err;
						}
					});
			});
			it('Should reject users with password greater than 72 characters', function() {
				return chai
					.request(app)
					.post('/api/users')
					.send({
						username,
						password: new Array(74).fill('a').join(''),
						firstName,
						lastName,
						email,
						bday
					})
					.then(res => {
						expect(res).to.have.status(422);
						expect(res.body.reason).to.equal('ValidationError');
						expect(res.body.message).to.equal(
							'Must be at most 72 characters long'
						);
						expect(res.body.location).to.equal('password');
					})
					.catch(err => {
						if (err instanceof chai.AssertionError) {
							throw err;
						}
					});
			});
			it('Should reject users with duplicate username', function() {
				return chai.request(app).post('/api/users').send({
					username,
					password,
					firstName,
					lastName,
					email,
					bday
				})
					.then(res => {
						expect(res).to.have.status(422);
						expect(res.body.reason).to.equal('ValidationError');
						expect(res.body.message).to.equal(
							'Username already taken'
						);
						expect(res.body.location).to.equal('username');
					})
					.catch(err => {
						if (err instanceof chai.AssertionError) {
							throw err;
						}
					});
			});
		});
	});
});

