const golos = require('golos-js');
const env = require('../core/Env');
const BasicService = require('../core/service/Basic');
const logger = require('../core/Logger');
const stats = require('../core/Stats').client;
const Post = require('../model/Post');

class Liker extends BasicService {
    constructor(plan) {
        super();

        this._plan = plan;
    }

    async start() {
        this.startLoop(0, this._plan.step);
    }

    async stop() {
        this.stopLoop();
    }

    async iteration() {
        const record = await this._getTarget();

        if (!record) {
            this.stopLoop();
            await this._markPlanAsDone();
            this.done();

            return;
        }

        const targetMsg = `Target - ${record.author} (id: ${record.id})`;

        logger.log(`It's Like machine time! ;) ${targetMsg}`);

        await this._likePost(record);
        await this._markPostAsLiked(record);

        stats.increment('make_like');
    }

    async _getTarget() {
        const query = { plan: this._plan._id, processed: false };
        const projection = { author: true, permlink: true };

        return await Post.findOne(query, projection);
    }

    async _likePost(record) {
        try {
            const timer = new Date();

            await golos.broadcast.voteAsync(
                env.WIF,
                env.LOGIN,
                record.author,
                record.permlink,
                this._plan.weight
            );

            stats.timing('like_request', new Date() - timer);
        } catch (error) {
            stats.increment('make_like_error');
            logger.error(`Like Machine request error - ${error}`);
            process.exit(1);
        }
    }

    async _markPostAsLiked(record) {
        record.processed = true;

        await record.save();
    }

    async _markPlanAsDone() {
        const id = this._plan._id;

        // Filter for really high load
        if (this.isDone()) {
            return;
        }

        this._plan.done = true;

        await this._plan.save();

        stats.increment('plan_done');
        logger.info(`Plan ${id} is done!`);
    }
}

module.exports = Liker;
