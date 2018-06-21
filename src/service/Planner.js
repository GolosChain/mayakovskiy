const BasicService = require('../core/BasicService');
const logger = require('../core/Logger');
const Moments = require('../core/Moments');
const Post = require('../model/Post');
const Plan = require('../model/Plan');

// BlockChain constants
const THE_100_PERCENT_DECIMALS = 100 * 100;
const VOTE_BY_DAY_WITH_MAX_WEIGHT = 40;
const DAY_VOTE_WEIGHT = THE_100_PERCENT_DECIMALS * VOTE_BY_DAY_WITH_MAX_WEIGHT;

class Planner extends BasicService {
    constructor(Liker) {
        super();

        this._liker = Liker;
    }

    async start() {
        await this.restore();

        this.startLoop(Moments.remainedToNextDay, Moments.oneDay);
    }

    async restore() {
        const corruptedPlans = (await Plan.find(
            { processed: false },
            { _id: true }
        )).map(doc => doc._id);

        for (let plan of corruptedPlans) {
            const posts = await Post.find({ plan: plan._id });

            for (let post of posts) {
                post.plan = null;

                await post.save();
            }

            plan.remove();
        }
    }

    async iteration() {
        logger.log('Make new plan...');

        const data = await this._aggregateData();

        if (data.length === 0) {
            logger.error('No posts from golos.io?!');
            return;
        }

        const plan = await this._makePlan(data);
        const liker = new this._liker(plan);

        logger.log('Making plan done, start new Liker');

        await liker.start();
    }

    async _aggregateData() {
        return (await Post.find(
            {
                date: {
                    $lt: Moments.currentDayStart,
                },
                plan: null,
            },
            {
                _id: true,
            }
        )).map(doc => doc._id);
    }

    async _makePlan(data) {
        const count = data.length;
        const step = Math.floor(Moments.oneDay / count);
        let weight = Math.floor(DAY_VOTE_WEIGHT / count);

        // less then 40 posts
        if (weight > THE_100_PERCENT_DECIMALS) {
            weight = THE_100_PERCENT_DECIMALS;
        }

        const plan = new Plan({ step, weight });

        await plan.save();

        for (let id of data) {
            const update = { $set: { plan: plan._id } };
            await Post.findByIdAndUpdate(id, update);
        }

        plan.processed = true;
        plan.save();

        return plan;
    }
}

module.exports = Planner;
