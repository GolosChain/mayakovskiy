const logger = require('./core/Logger');
const AbstractService = require('./core/AbstractService');
const OfficialCustomerService = require('./officialСustomerService/Main');

class Main extends AbstractService {
    constructor() {
        super();

        // TODO configuration

        this.services = [
            new OfficialCustomerService(),
            // any another services here
        ];

        process.on('exit', this.stop);
        process.on('SIGINT', this.stop);
    }

    start() {
        logger.info('Start services...');

        this.services.forEach(service => {
            logger.info(`\tStart ${service.constructor.name}...`);
            service.start();
            logger.info(`\tThe ${service.constructor.name} done!`);
        });

        logger.info('Start services done!');
    }

    stop() {
        logger.info('Cleanup...');

        this.services.forEach(service => {
            logger.info(`\tStop ${service.constructor.name}...`);
            service.stop();
            logger.info(`\tThe ${service.constructor.name} done!`);
        });

        logger.info('Cleanup done!');
    }
}

new Main().start();
