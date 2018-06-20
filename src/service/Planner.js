const BasicService = require('../core/BasicService');
const logger = require('../core/Logger');
const Moments = require('../core/Moments');
const Post = require('../model/Post');
const Plan = require('../model/Plan');

class Planner extends BasicService {
    constructor(LikerService) {
        super();

        this._likerService = LikerService;
    }

    async start() {
        await this.restore();

        this.startLoop(Moments.remainedToNextDay, Moments.oneDay);
    }

    async restore() {
        // TODO restore from last done
    }

    async iteration() {
        logger.log('Make new plan...');

        const data = await this._aggregateData();

        if (data.length === 0) {
            logger.error('No posts from golos.io?!');
            return;
        }

        const plan = await this._makePlan(data);
        const liker = new this._likerService(plan);

        logger.log('Making plan done, start new Liker');

        await liker.start();
    }

    async _aggregateData() {
        return (await Post.find(
            {
                date: {
                    $gt: Moments.lastDayStart,
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
        let weight = Math.floor((100 * 40) / count);

        // less then 40 posts
        if (weight > 100) {
            weight = 100;
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
