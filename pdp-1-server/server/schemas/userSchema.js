const mongoose = require('mongoose');

const {Schema} = mongoose;


const userSchema = new Schema({
    login: {type: String, required: true},
    name: {type: String, required: true},
    password: {type: String, required: false},
    birthDate: String,
    picture: String
});

module.exports = {User: mongoose.model('User', userSchema)}