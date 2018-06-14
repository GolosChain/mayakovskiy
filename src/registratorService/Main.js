const AbstractService = require('../core/AbstractService');
const BlockChain = require('../core/BlockChain');
const mongoose = require('../core/MongoDB').mongoose;
const logger = require('../core/Logger');

class RegistratorService extends AbstractService {
    async start() {
        await this.restore();

        BlockChain.eachPostRealTime(async data => {
            let isValid;

            isValid = this._basicValidation(data);

            if (!isValid) return;

            isValid = this._extraValidation(data);

            if (!isValid) return;

            try {
                isValid = await this._remoteValidation(data);
            } catch (error) {
                logger.error(`Remote validation failed - ${error}`);
                isValid = false;
            }

            if (!isValid) return;

            this._register(data);
        });
    }

    async restore() {
        // TODO restore from block chain
    }

    _basicValidation(data) {
        // TODO -
    }

    _extraValidation(data) {
        // no extra validators for now
        return true;
    }

    _remoteValidation(data) {
        // no remote validators for now
        return Promise.resolve(true);
    }

    _register(data) {
        // TODO -
    }
}

module.exports = RegistratorService;
