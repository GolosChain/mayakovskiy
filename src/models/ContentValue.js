const core = require('gls-core-service');
const MongoDB = core.services.MongoDB;

module.exports = MongoDB.makeModel('ContentValue', {
    contentType: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        required: true,
        default: 1,
    },
});
