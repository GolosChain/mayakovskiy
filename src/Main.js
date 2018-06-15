const logger = require('./core/Logger');
const AbstractService = require('./core/AbstractService');
const RegistratorService = require('./registratorService/Main');
const PlannerService = require('./plannerService/Main');
const LikerService = require('./likerService/Main');
const MongoDB = require('./core/MongoDB');
const BlockChainConnector = require('./core/BlockChainConnector');

class Main extends AbstractService {
    constructor() {
        super();

        // TODO configuration

        this.nestedServices.push(
            new RegistratorService(),
            new PlannerService(LikerService)
        );

        this.stopOnExit();
    }

    async start() {
        await BlockChain.connect();
        await MongoDB.connect();
        await this.startNested();
    }

    async stop() {
        await this.stopNested();
        await MongoDB.disconnect();
        await BlockChain.disconnect();
    }
}

new Main().start().then(
    () => logger.info('Main service started!'),
    () => {
        logger.error('Main service failed!');
        process.exit(99);
    }
);
