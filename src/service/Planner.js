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

        this.startLoop(Moments.oneDay, Moments.remainedToNextDay)
    }

    async restore() {
        // TODO restore from last done
    }

    async iteration() {
        logger.log('Make new plan...');

        const data = await this._aggregateData();
        const plan = await this._makePlan(data);
        const liker = new this._likerService(plan);

        logger.log('Making plan done, start new Liker');

        await liker.start();
    }

    async _aggregateData() {
        return await Post.find(
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
        );
    }

    async _makePlan(data) {
        const virtualPlan = new Plan({
            step: null, // TODO -
            weight: null, // TODO -
        });

        const plan = await virtualPlan.save();

        for (let item of data) {
            const { _id: id } = item;
            const update = { $set: { plan: plan._id } };

            await Post.findByIdAndUpdate(id, update);
        }

        return plan;
    }
}

module.exports = Planner;
