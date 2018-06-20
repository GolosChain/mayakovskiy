const mongoose = require('mongoose');
const logger = require('./Logger');

class MongoDB {
    static async connect(connectionString) {
        return new Promise((resolve, reject) => {
            const connection = mongoose.connection;

            connection.on('error', error => {
                logger.error(`MongoDB - ${error}`);
            });
            connection.once('error', error => {
                reject(error);
            });
            connection.once('open', () => {
                logger.info('MongoDB connection established.');
                resolve();
            });

            mongoose.connect(connectionString || 'mongodb://0.0.0.0/admin');
        });
    }

    static async disconnect() {
        await mongoose.disconnect();
        logger.info('MongoDB disconnected.');
    }

    static makeModel(name, config) {
        return mongoose.model(name, new mongoose.Schema(config));
    }

    static get type() {
        return mongoose.Schema.Types;
    }
}

module.exports = MongoDB;
