const core = require('gls-core-service');
const BasicConnector = core.services.Connector;
const Moderation = require('../controllers/Moderation');

class Connector extends BasicConnector {
    constructor({ ManualPlanner }) {
        super();
        this.ManualPlanner = ManualPlanner;
        this.Moderation = new Moderation({ connector: this });
    }
    async start() {
        await this.ManualPlanner.start();
        await super.start({
            serverRoutes: {
                listPosts: this.Moderation.listPosts.bind(this.Moderation),
                denyPosts: this.Moderation.denyPosts.bind(this.Moderation),
                approvePosts: this.Moderation.approvePosts.bind(this.Moderation),
            },
        });
    }
}

module.exports = Connector;
