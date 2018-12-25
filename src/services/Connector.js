const core = require('gls-core-service');
const BasicConnector = core.services.Connector;
const Moderation = require('../controllers/Moderation');
const Authorization = require('../controllers/Authorization');

class Connector extends BasicConnector {
    constructor({ ManualPlanner, adminUsername }) {
        super();
        this.ManualPlanner = ManualPlanner;
        this.Moderation = new Moderation({ connector: this });
        this.Authorization = new Authorization({ connector: this, adminUsername });
    }
    async start() {
        await this.ManualPlanner.start();
        await super.start({
            serverRoutes: {
                listPosts: this.Moderation.listPosts.bind(this.Moderation),
                denyPosts: this.Moderation.denyPosts.bind(this.Moderation),
                approvePosts: this.Moderation.approvePosts.bind(this.Moderation),
                getRole: this.Authorization.getRole.bind(this.Authorization),
                getAuthorizationsList: this.Authorization.getAuthorizationsList.bind(
                    this.Authorization
                ),
                grantAccess: this.Authorization.grantAccess.bind(this.Authorization),
                revokeAccess: this.Authorization.revokeAccess.bind(this.Authorization),
                updateRole: this.Authorization.updateRole.bind(this.Authorization),
            },
        });
    }
}

module.exports = Connector;
