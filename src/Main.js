const logger = require('./core/Logger');
const AbstractService = require('./core/BasicService');
const Registrator = require('./service/Registrator');
const Planner = require('./service/Planner');
const Liker = require('./service/Liker');
const MongoDB = require('./core/MongoDB');

class Main extends AbstractService {
    constructor() {
        super();

        this.nestedServices.push(new Registrator(), new Planner(Liker));
        this.stopOnExit();
    }

    async start() {
        await MongoDB.connect();
        await this.startNested();
    }

    async stop() {
        await this.stopNested();
        await MongoDB.disconnect();
        process.exit(0);
    }
}

new Main().start().then(
    () => logger.info('Main service started!'),
    error => {
        logger.error(`Main service failed - ${error}`);
        process.exit(99);
    }
);
