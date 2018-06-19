const golos = require('golos-js');
const BasicService = require('../core/BasicService');
const logger = require('../core/Logger');
const Post = require('../model/Post');
const Plan = require('../model/Plan');

const MARK_PROCESSED = { $set: { processed: true } };
const MARK_DONE = { $set: { done: true } };

class Liker extends BasicService {
    constructor(plan) {
        super();

        this._plan = plan;
        this._done = false;
    }

    async start() {
        await this.restore();

        this.startLoop(this._plan.step);
    }

    async restore() {
        // TODO restore from last plan
    }

    async iteration() {
        const { id, author, permlink, weight } = await this._getTarget();

        if (!id) {
            this.stopLoop();
            await this._markPlanAsDone();

            return;
        }

        logger.log(`It's Like machine time! ;) Target - ${author} : ${id}`);

        await this._likePost(author, permlink, weight);
        await this._markPostAsLiked(id);
    }

    async _getTarget() {
        const query = { plan: this.plan._id };
        const projection = { author: true, permlink: true };
        const { _id, author, permlink } = await Post.findOne(query, projection);

        return {
            id: _id,
            author,
            permlink,
            weight: this._plan.weight,
        };
    }

    _likePost(author, permlink, weight) {
        return new Promise((resolve, reject) => {
            golos.broadcast.vote(
                process.env.WIF,
                process.env.LOGIN,
                author,
                permlink,
                weight,
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

    async _markPostAsLiked(id) {
        await Post.findByIdAndUpdate(id, MARK_PROCESSED);
    }

    async _markPlanAsDone() {
        const id = this._plan._id;

        // Filter for really high load
        if (this._done) {
            return;
        } else {
            this._done = true;
        }

        await Plan.findByIdAndUpdate(id, MARK_DONE);

        logger.info(`Plan ${id} is done!`);
    }
}

module.exports = Liker;
