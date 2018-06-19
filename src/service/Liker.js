const AbstractService = require('../core/AbstractService');
const logger = require('../core/Logger');
const Post = require('../model/Post');

class Liker extends AbstractService {
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

module.exports = Liker;
