const logger = require('./Logger');

class AbstractService {
    constructor() {
        this.nestedServices = [];
        this.basicLoopInterval = Infinity;
        this.basicFirstLoopIterationTimeout = Infinity;
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

    async startNested() {
        logger.info('Start services...');

        for (let service of this.nestedServices) {
            logger.info(`Start ${service.constructor.name}...`);
            await service.start();
            logger.info(`The ${service.constructor.name} done!`);
        }

        logger.info('Start services done!');
    }

    async stopNested() {
        logger.info('Cleanup...');

        for (let service of this.nestedServices) {
            logger.info(`Stop ${service.constructor.name}...`);
            await service.stop();
            logger.info(`The ${service.constructor.name} done!`);
        }

        logger.info('Cleanup done!');
    }

    stopOnExit() {
        process.on('SIGINT', this.stop.bind(this));
    }

    eachTriggeredTime(callback) {
        setTimeout(() => {
            callback();
            setInterval(callback, this.basicLoopInterval);
        }, this.basicFirstLoopIterationTimeout);
    }
}

module.exports = AbstractService;
