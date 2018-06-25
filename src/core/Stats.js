const StatsDClient = require('node-statsd');
const env = require('./Env');
const logger = require('./Logger');

class Stats {
    static get client() {
        if (!this._client) {
            this._init();
        }

        return this._client;
    }

    static _init() {
        this._client = new StatsDClient({
            host: env.METRICS_HOST,
            port: env.METRICS_PORT,
        });

        this._client.socket.on('error', error => {
            logger.error(`Metrics error - ${error}`);
        });
    }
}

module.exports = Stats;
