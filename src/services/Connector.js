const core = require('gls-core-service');
const BasicConnector = core.services.Connector;
const Moderation = require('../controllers/Moderation');
const Authorization = require('../controllers/Authorization');
const ContentValues = require('../controllers/ContentValues');

class Connector extends BasicConnector {
    constructor({ manualPlanner, adminUsername }) {
        super();
        this.manualPlanner = manualPlanner;
        this.moderation = new Moderation({ connector: this });
        this.authorization = new Authorization({ connector: this, adminUsername });
        this.contentValues = new ContentValues({ connector: this });
    }
    async start() {
        await this.manualPlanner.start();
        await this.contentValues.initialize();
        await super.start({
            serverRoutes: {
                listPosts: this.moderation.listPosts.bind(this.moderation),
                denyPosts: this.moderation.denyPosts.bind(this.moderation),
                approvePosts: this.moderation.approvePosts.bind(this.moderation),
                getRole: this.authorization.getRole.bind(this.authorization),
                getAuthorizationsList: this.authorization.getAuthorizationsList.bind(
                    this.authorization
                ),
                grantAccess: this.authorization.grantAccess.bind(this.authorization),
                revokeAccess: this.authorization.revokeAccess.bind(this.authorization),
                updateRole: this.authorization.updateRole.bind(this.authorization),
                getContentValueList: this.contentValues.getContentValueList.bind(
                    this.contentValues
                ),
                createContentValue: this.contentValues.createContentValue.bind(this.contentValues),
                updateContentValue: this.contentValues.updateContentValue.bind(this.contentValues),
                deleteContentValue: this.contentValues.deleteContentValue.bind(this.contentValues),
            },
        });
    }
}

module.exports = Connector;
