const logger = require('./Logger');

class AbstractService {
    start() {
        throw 'No service start logic';
    }

    stop() {
        logger.log(`No extra stop logic for service ${this.constructor.name}`);
    }
}
