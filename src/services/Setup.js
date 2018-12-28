const core = require('gls-core-service');
const BasicService = core.services.Basic;
const ContentValue = require('../models/ContentValue');
const env = require('../data/env');

class Setup extends BasicService {
    async start() {
        await this.createDefaultContentValues();

        return this.done();
    }

    async createDefaultContentValues() {
        const amount = await ContentValue.estimatedDocumentCount();
        if (amount === 0) {
            return await ContentValue.create({
                contentType: env.GLS_CONTENT_TYPE_DEFAULT,
                valueCoefficient: env.GLS_CONTENT_VALUE_DEFAULT,
            });
        }
    }
}

module.exports = Setup;
