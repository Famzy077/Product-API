const mongoose = require('mongoose');
const { Schema } = mongoose;

const profilePictureSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    image: { type: String, required: true },
});
module.exports = mongoose.model('ProfilePicture', profilePictureSchema);