const AbstractService = require('../core/AbstractService');
const BlockChain = require('../core/BlockChain');
const mongoose = require('../core/MongoDB').getMongoose();
const logger = require('../core/Logger');

class LikerService extends AbstractService {
    constructor(plan) {
        super();

        // TODO use plan
    }

    async start() {
        await this.restore();

        this.eachTriggeredTime(async () => {
            const targets = await this._getTargets();

            targets.forEach(async id => {
                await this._likePost(id);
                await this._markPostAsLiked(id);
            });
        });
    }

    async restore() {
        // TODO restore from last plan
    }

    eachTriggeredTime(callback) {
        // TODO calc interval

        super.eachTriggeredTime(callback);
    }

    _getTargets() {
        // TODO -
    }

    _likePost(id) {
        // TODO -
    }

    _markPostAsLiked(id) {
        // TODO -
    }
}

module.exports = LikerService;
