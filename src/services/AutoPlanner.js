const core = require('gls-core-service');
const stats = core.utils.statsClient;
const Post = require('../models/Post');
const PlannerBasic = require('./PlannerBasic');

class Planner extends PlannerBasic {
    async _aggregateData() {
        const timer = new Date();
        const data = (await Post.find(
            {
                plan: null,
            },
            {
                _id: true,
            }
        )).map(doc => doc._id);

        stats.timing('plan_data_aggregation', new Date() - timer);

        return data;
    }
}

module.exports = Planner;
