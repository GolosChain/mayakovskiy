const core = require('gls-core-service');
const MongoDB = core.services.MongoDB;

module.exports = MongoDB.makeModel('Authorization', {
    username: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        default: 'moderator',
    },
});
