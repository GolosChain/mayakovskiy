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

        this.nestedServices.forEach(async service => {
            logger.info(`\tStart ${service.constructor.name}...`);
            await service.start();
            logger.info(`\tThe ${service.constructor.name} done!`);
        });

        logger.info('Start services done!');
    }

    async stopNested() {
        logger.info('Cleanup...');

        this.nestedServices.forEach(async service => {
            logger.info(`\tStop ${service.constructor.name}...`);
            await service.stop();
            logger.info(`\tThe ${service.constructor.name} done!`);
        });

        logger.info('Cleanup done!');
    }

    stopOnExit() {
        process.on('exit', this.stop);
        process.on('SIGINT', this.stop);
    }

    eachTriggeredTime(callback) {
        setTimeout(() => {
            callback();
            setInterval(callback, this.basicLoopInterval);
        }, this.basicFirstLoopIterationTimeout);
    }
}
