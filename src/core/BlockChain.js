const W3CWebSocket = require('websocket').w3cwebsocket;
const logger = require('./Logger');

class BlockChain {
    static async connect() {
        this.listeners = [];

        return new Promise((resolve, reject) => {
            this.socket = new W3CWebSocket('wss://ws.golos.io');

            this.socket.onerror = error => {
                logger.error(`BlockChain socket error - ${error}`);
                reject();
            };

            this.socket.onopen = () => {
                logger.info('BlockChain socket connection established.');
                resolve();
            };

            this.socket.onclose = () => {
                this._disconnectCallback && this._disconnectCallback();
                logger.info('BlockChain socket disconnected.');
            };

            this.socket.onmessage = data => {
                this.listeners.forEach(listener => {
                    listener && listener(data);
                });
            };
        });
    }

    static async disconnect() {
        this.listeners = [];

        return new Promise((resolve, reject) => {
            try {
                this._disconnectCallback = () => {
                    resolve();
                    delete this._disconnectCallback;
                };

                this.socket.close();
            } catch (error) {
                delete this._disconnectCallback;
                reject();
            }
        });
    }

    static eachBlockRealTime(callback) {
        (function loop() {
            // TODO -

            setImmediate(loop);
        }.bind(this)());
    }

    static eachTransactionRealTime(callback) {
        this.eachBlockRealTime(data => {
            // TODO filtrate only blocks with transactions
        });
    }

    static eachPostRealTime(callback) {
        this.eachTransactionRealTime(data => {
            // TODO filtrate only blocks with posts
        });
    }
}

module.exports = BlockChain;
