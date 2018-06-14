const AbstractService = require('../core/AbstractService');
const mongoose = require('../core/MongoDB').getMongoose();
const logger = require('../core/Logger');

class PlannerService extends AbstractService {
    constructor(LikerService) {
        super();

        this._likerService = LikerService;
    }

    async start() {
        await this.restore();

        this.eachTriggeredTime(async () => {
            const data = await this._aggregateData();
            const plan = await this._makePlan(data);
            const liker = new this._likerService(plan);

            await liker.start();
        });
    }

    async restore() {
        // TODO restore from last done
    }

    eachTriggeredTime(callback) {
        // TODO calc interval

        super.eachTriggeredTime(callback);
    }

    _aggregateData() {
        // TODO -
    }

    _makePlan(data) {
        // TODO -
    }
}

module.exports = PlannerService;
