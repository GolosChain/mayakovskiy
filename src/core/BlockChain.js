const W3CWebSocket = require('websocket').w3cwebsocket;
const logger = require('./Logger');

const SOCKET_TIMEOUT = 5000;
const BLOCK_GENERATION_AVERAGE_MS = 3000;

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
        (async function init() {
            let currentBlockNumber = await this.getCurrentBlockNumber();

            (async function loop() {
                let data = await this.getBlockData(currentBlockNumber);

                if (data) {
                    currentBlockNumber++;
                    callback(data);
                    setImmediate(loop);
                } else {
                    setTimeout(loop, BLOCK_GENERATION_AVERAGE_MS);
                }
            }.bind(this)());
        }.bind(this)());
    }

    static eachTransactionRealTime(callback) {
        this.eachBlockRealTime(data => {
            data.transactions.forEach(transaction => callback(transaction));
        });
    }

    static eachPostRealTime(callback) {
        this.eachTransactionRealTime(data => {
            data.operations.forEach(operation => {
                const [type, data] = operation;

                // duck typing, no any way
                if (type === 'comment' && data.title) {
                    callback(data);
                }
            });
        });
    }

    static async getCurrentBlockNumber() {
        const params = ['database_api', 'get_dynamic_global_properties', []];
        const request = this._makeRequestObject('call', params);
        const response = await this.sendOverJsonRpc(request);

        return response.result.head_block_number;
    }

    static async getBlockData(blockNumber) {
        const params = ['database_api', 'get_block', [blockNumber]];
        const request = this._makeRequestObject('call', params);
        const response = await this.sendOverJsonRpc(request);

        return response.result;
    }

    static sendOverJsonRpc(data) {
        return new Promise((resolve, reject) => {
            this.socket.send(JSON.stringify(data));

            this.listeners[data.id] = response => {
                /* do not add any logic here -
                   called after socket timeout too,
                   but promise freeze after reject call,
                   used for avoid unknown id */
                resolve(response);
            };

            setTimeout(() => {
                if (this.listeners[data.id]) {
                    logger.error('BlockChain socket timeout.');
                    reject();
                }
            }, SOCKET_TIMEOUT);
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

    static _makeListenerId() {
        return ++this.lastListenerId;
    }

    static _resetListenersMeta() {
        this.listeners = {};
        this.lastListenerId = 0;
    }

    static _makeRequestObject(rpcMethod, paramsArray) {
        return {
            id: this._makeListenerId(),
            method: rpcMethod,
            params: paramsArray,
            jsonrpc: '2.0',
        };
    }
}

module.exports = BlockChain;
