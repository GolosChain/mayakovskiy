const core = require('gls-core-service');
const MongoDB = core.services.MongoDB;

module.exports = MongoDB.makeModel('Post', {
    author: {
        type: String,
        required: true,
        index: true,
    },
    permlink: {
        type: String,
        required: true,
    },
    processed: {
        type: Boolean,
        default: false,
    },
    approved: {
        type: Boolean,
        default: null,
    },
    plan: {
        type: MongoDB.type.ObjectId,
        default: null,
        index: {
            sparse: true,
        },
    },
    date: {
        type: Date,
        default: Date.now,
    },
    blockNum: {
        type: Number,
        required: true,
        index: -1,
    },
});
