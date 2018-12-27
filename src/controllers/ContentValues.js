const core = require('gls-core-service');
const BasicController = core.controllers.Basic;
const ContentValue = require('../models/ContentValue');
const Env = require('../data/env');

class ContentValues extends BasicController {
    async initialize() {
        const amount = await ContentValue.estimatedDocumentCount();
        if (amount === 0) {
            return await ContentValue.create({
                contentType: Env.GLS_CONTENT_TYPE_DEFAULT,
                valueCoefficient: Env.GLS_CONTENT_VALUE_DEFAULT,
            });
        }
    }
    async getContentValueList({ user }) {
        if (await this.connector.Authorization.hasModerationAccess({ user })) {
            return await ContentValue.find({});
        }
    }

    async createContentValue({ user, contentValue }) {
        if (await this.connector.Authorization.hasModerationAccess({ user })) {
            return await ContentValue.create({ ...contentValue });
        }
    }

    async updateContentValue({ user, contentValue }) {
        if (await this.connector.Authorization.hasModerationAccess({ user })) {
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
