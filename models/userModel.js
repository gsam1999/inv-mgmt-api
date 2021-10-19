const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    branches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    }],
    active: { type: Boolean, required: true }
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)