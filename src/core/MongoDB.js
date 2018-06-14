const mongoose = require('mongoose');
const logger = require('Logger');

class MongoDB {
    static getMongoose() {
        return mongoose;
    }

    static connect(connectionString) {
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

            mongoose.connect(connectionString || 'mongodb://localhost/db');
        });
    }
}

module.exports = MongoDB;
