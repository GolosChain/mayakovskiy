const core = require('gls-core-service');
const BasicController = core.controllers.Basic;
const ContentValue = require('../models/ContentValue');

class ContentValues extends BasicController {
    async getContentValueList({ user }) {
        if (await this.connector.authorization.hasModerationAccess({ user })) {
            return await ContentValue.find({});
        }
    }

    async createContentValue({ user, contentValue }) {
        if (await this.connector.authorization.hasModerationAccess({ user })) {
            return await ContentValue.create({ ...contentValue });
        }
    }

    async updateContentValue({ user, contentValue }) {
        if (await this.connector.authorization.hasModerationAccess({ user })) {
            if (!contentValue._id) {
                throw {
                    code: 400,
                    message: '_id is undefined',
                };
            }
            return await ContentValue.findByIdAndUpdate(contentValue._id, {
                $set: { ...contentValue },
            });
        }
    }

    async deleteContentValue({ user, contentValue }) {
        if (await this.connector.Authorization.hasModerationAccess({ user })) {
            return await ContentValue.findAndDelete({ ...contentValue });
        }
    }
}

module.exports = ContentValues;
