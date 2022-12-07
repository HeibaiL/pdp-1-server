const mongoose = require('mongoose');

const {Schema} = mongoose;


const tokenSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User"},
    refreshToken: {type: String, required: true}
});

module.exports = {Token: mongoose.model('Token', tokenSchema)}