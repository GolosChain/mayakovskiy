const logger = require('./Logger');

class BasicService {
    constructor() {
        this.nestedServices = [];
        this._loopInterval = Infinity;
        this._firstIterationTimeout = 0;
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

    async iteration() {
        throw 'Empty iteration body';
    }

    startLoop(interval, firstIterationTimeout) {
        this._loopInterval = interval || Infinity;
        this._firstIterationTimeout = firstIterationTimeout || 0;

        this._eachTriggeredTime(this.iteration);
    }

    stopLoop() {
        clearInterval(this._loopId);
    }

    _eachTriggeredTime(callback) {
        const interval = this._loopInterval;
        const timeout = this._firstIterationTimeout;

        setTimeout(() => {
            callback.bind(this);
            this._loopId = setInterval(callback.bind(this), interval);
        }, timeout);
    }
}

module.exports = BasicService;
