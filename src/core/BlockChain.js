const W3CWebSocket = require('websocket').w3cwebsocket;
const logger = require('./Logger');

class BlockChain {
    static async connect() {
        this._resetListenersMeta();

        return new Promise((resolve, reject) => {
            this.socket = new W3CWebSocket('wss://ws.golos.io');
            this._makeEventHandlers(resolve, reject);
            this.socket.onmessage = this._messageHandler;
        });
    }

    static async disconnect() {
        this._resetListenersMeta();

        return new Promise((resolve, reject) => {
            try {
                this._disconnectCallback = () => {
                    resolve();
                    delete this._disconnectCallback;
                };

                this.socket.close();
                delete this.socket;
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

    static _makeEventHandlers(resolve, reject) {
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
    }

    static _messageHandler(rawData) {
        let data = this._parseMessageData(rawData);

        if (!data) {
            return;
        }

        if (this.listeners[data.id]) {
            this._callListener(this.listeners[data.id], data);
            delete this.listeners[data.id];
        } else {
            logger.error('Unknown BlockChain socket message id.');
        }
    }

    static _parseMessageData(rawData) {
        try {
            return JSON.parse(rawData);
        } catch (error) {
            logger.error(`Invalid BlockChain socket data - ${error}`);
            return null;
        }
    }

    static _callListener(listener, data) {
        if (typeof listener === 'function') {
            listener(data);
        } else {
            logger.error(`Invalid BlockChain message handler.`);
        }
    }

    static makeListenerId() {
        return ++this.lastListenerId;
    }

    static _resetListenersMeta() {
        this.listeners = {};
        this.lastListenerId = 0;
    }
}

module.exports = BlockChain;
