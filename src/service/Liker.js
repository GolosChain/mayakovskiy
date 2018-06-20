const golos = require('golos-js');
const BasicService = require('../core/BasicService');
const logger = require('../core/Logger');
const Post = require('../model/Post');

class Liker extends BasicService {
    constructor(plan) {
        super();

        this._plan = plan;
        this._done = false;
    }

    async start() {
        await this.restore();

        this.startLoop(0, this._plan.step);
    }

    async restore() {
        // TODO restore from last plan
    }

    async iteration() {
        const record = await this._getTarget();

        if (!record) {
            this.stopLoop();
            await this._markPlanAsDone();

            return;
        }

        const targetMsg = `Target - ${record.author} (id: ${record.id})`;

        logger.log(`It's Like machine time! ;) ${targetMsg}`);

        await this._likePost(record);
        await this._markPostAsLiked(record);
    }

    async _getTarget() {
        const query = { plan: this._plan._id, processed: false };
        const projection = { author: true, permlink: true };

        return await Post.findOne(query, projection);
    }

    _likePost(record) {
        return new Promise((resolve, reject) => {
            golos.broadcast.vote(
                process.env.WIF,
                process.env.LOGIN,
                record.author,
                record.permlink,
                this._plan.weight,
                err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    async _markPostAsLiked(record) {
        record.processed = true;

        await record.save();
    }

    async _markPlanAsDone() {
        const id = this._plan._id;

        // Filter for really high load
        if (this._done) {
            return;
        }

        this._done = true;
        this._plan.done = true;

        await this._plan.save();

        logger.info(`Plan ${id} is done!`);
    }
}

module.exports = Liker;
