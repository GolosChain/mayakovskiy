const mongoose = require('../core/MongoDB').mongoose;

module.exports = mongoose.model(
    'Post',
    new mongoose.Schema({
        author: {
            type: String,
            required: true,
        },
        permlink: {
            type: String,
            required: true,
        },
        processed: {
            type: Boolean,
            default: false,
        },
        date: {
            type: Date,
            default: Date.now()
        }
    })
);
