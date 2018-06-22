const env = require('../Env');
const logger = require('../Logger');
const BasicService = require('../service/Basic');

class BlockSubscribe extends BasicService {
    static getBlockNum(blockHash) {
        return parseInt(blockHash.slice(0, 8), 16);
    }

    async start(callback) {
        // TODO -
    }

    async stop() {
        // TODO -
    }

    async blockBy(blockNum) {
        // TODO -
    }

    async retry() {
        // TODO -
    }
}

module.exports = BlockSubscribe;
