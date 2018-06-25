const mongoose = require('mongoose');
const env = require('../Env');
const logger = require('../Logger');
const BasicService = require('../service/Basic');
const stats = require('../Stats').client;

class MongoDB extends BasicService {
    static makeModel(name, config) {
        return mongoose.model(name, new mongoose.Schema(config));
    }

    static get type() {
        return mongoose.Schema.Types;
    }

    async start(forceConnectString = null) {
        return new Promise(resolve => {
            const connection = mongoose.connection;

            connection.on('error', error => {
                stats.increment('mongo_error');
                logger.error(`MongoDB - ${error}`);
                process.exit(1);
            });
            connection.once('open', () => {
                stats.increment('mongo_connected');
                logger.info('MongoDB connection established.');
                resolve();
            });

            mongoose.connect(forceConnectString || env.MONGO_CONNECT_STRING);
        });
    }

    async stop() {
        await mongoose.disconnect();
        logger.info('MongoDB disconnected.');
    }
}

module.exports = MongoDB;
