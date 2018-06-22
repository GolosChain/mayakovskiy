const env = require('../Env');
const logger = require('../Logger');
const BasicService = require('../service/Basic');

class Vote extends BasicService {
    async start(author, permlink, weight) {
        // TODO -
    }

    async stop() {
        // TODO -
    }

    async retry() {
        // TODO -
    }

    async _checkForAlreadyVoted() {
        // TODO -
    }
}

module.exports = Vote;
