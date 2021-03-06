'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	firstName: { type: String, default: '' },
	lastName: { type: String, default: '' },
	bday: { type: Date, required: true },
	email: { type: String, required: true },
	level: { type: Number, default: 1 },
	initialFund: { type: Number, default: 5000 },
	currentFund: { type: Number, default: 5000 },
	previousFund: {type: Number},
	risk: [{
		x: { type: Number, default: 0 },
		y: { type: Number, default: 5000 },
		strategy:{type: String},
		growth: {type: Number},
		previousYear: {type: Number}
	}],
	intro: {type: Boolean, default: false},
	year: { type: Number, default: 0 },
	year5Amt: {type: Number, default: 0},
	level2Intro: {type: Boolean, default: false}
});


UserSchema.virtual('riskArr').get(function() {
	return `${this.risk.x} 
          ${this.risk.y} 
          ${this.risk.strategy} 
          ${this.risk.growth} 
          ${this.risk.previousYear}`.trim();
});

// I'M SO LOST
UserSchema.methods.serialize = function() {
	return {
		username: this.username || '',
		firstName: this.firstName || '',
		lastName: this.lastName || '',
		id: this._id,
		bday: this.bday,
		email: this.email,
		level: this.level,
		initialFund: this.initialFund,
		currentFund: this.currentFund,
		previousFund: this.previousFund,
		risk: this.risk,
		intro: this.intro,
		year: this.year,
		year5Amt: this.year5Amt,
		level2Intro: this.level2Intro
	};
};

UserSchema.methods.validatePassword = function(password) {
	return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
	return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = { User };