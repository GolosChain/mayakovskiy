const logger = require('../Logger');

class Basic {
    constructor() {
        this._nestedServices = [];
        this._done = false;
    }

    isDone() {
        return this._done;
    }

    done() {
        this._done = true;
    }

    async start() {
        throw 'No service start logic';
    }

    async stop() {
        logger.log(`No extra stop logic for service ${this.constructor.name}`);
    }

    async restore() {
        logger.log(`No restore logic for service ${this.constructor.name}`);
    }

    async retry() {
        throw 'No retry logic';
    }

    addNested(...services) {
        this._nestedServices.push(...services);
    }

    async startNested() {
        logger.info('Start services...');

        for (let service of this._nestedServices) {
            logger.info(`Start ${service.constructor.name}...`);
            await service.start();
            logger.info(`The ${service.constructor.name} done!`);
        }

        logger.info('Start services done!');
    }

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

    stopOnExit() {
        process.on('SIGINT', this.stop.bind(this));
    }

    async iteration() {
        throw 'Empty iteration body';
    }

    startLoop(firstIterationTimeout = 0, interval = Infinity) {
        setTimeout(async () => {
            await this.iteration();
            this._loopId = setInterval(this.iteration.bind(this), interval);
        }, firstIterationTimeout);
    }

    stopLoop() {
        clearInterval(this._loopId);
    }
}

module.exports = Basic;
