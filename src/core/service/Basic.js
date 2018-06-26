const logger = require('../Logger');

/**
 * //
 */
class Basic {
    constructor() {
        this._nestedServices = [];
        this._done = false;
    }

    /**
     * //
     * @returns {boolean}
     */
    isDone() {
        return this._done;
    }

    /**
     * //
     */
    done() {
        this._done = true;
    }

    /**
     * //
     * @returns {Promise<void>}
     */
    async start() {
        throw 'No service start logic';
    }

    /**
     * //
     * @returns {Promise<void>}
     */
    async stop() {
        logger.log(`No extra stop logic for service ${this.constructor.name}`);
    }

    /**
     * //
     * @returns {Promise<void>}
     */
    async restore() {
        logger.log(`No restore logic for service ${this.constructor.name}`);
    }

    /**
     * //
     * @returns {Promise<void>}
     */
    async retry() {
        throw 'No retry logic';
    }

    /**
     * //
     * @param services
     */
    addNested(...services) {
        this._nestedServices.push(...services);
    }

    /**
     * //
     * @returns {Promise<void>}
     */
    async startNested() {
        logger.info('Start services...');

        for (let service of this._nestedServices) {
            logger.info(`Start ${service.constructor.name}...`);
            await service.start();
            logger.info(`The ${service.constructor.name} done!`);
        }

        logger.info('Start services done!');
    }

    /**
     * //
     * @returns {Promise<void>}
     */
    async stopNested() {
        logger.info('Cleanup...');

        for (let service of this._nestedServices.reverse()) {
            logger.info(`Stop ${service.constructor.name}...`);

            if (!service.isDone()) {
                await service.stop();
            }

            logger.info(`The ${service.constructor.name} done!`);
        }

        logger.info('Cleanup done!');
    }

    /**
     * //
     */
    stopOnExit() {
        process.on('SIGINT', this.stop.bind(this));
    }

    /**
     * //
     * @returns {Promise<void>}
     */
    async iteration() {
        throw 'Empty iteration body';
    }

    /**
     * //
     * @param firstIterationTimeout
     * @param interval
     */
    startLoop(firstIterationTimeout = 0, interval = Infinity) {
        setTimeout(async () => {
            await this.iteration();
            this._loopId = setInterval(this.iteration.bind(this), interval);
        }, firstIterationTimeout);
    }

    /**
     * //
     */
    stopLoop() {
        clearInterval(this._loopId);
    }
}

module.exports = Basic;
