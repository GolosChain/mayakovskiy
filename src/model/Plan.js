const MongoDB = require('../core/MongoDB');

module.exports = MongoDB.makeModel('Plan', {
    date: {
        type: Date,
        default: Date.now(),
    },
    processed: {
        type: Boolean,
        default: false,
    },
    done: {
        type: Boolean,
        default: false,
    },
    step: {
        type: Number,
        required: true,
    },
    weight: {
        type: Number,
        required: true,
    },
});
