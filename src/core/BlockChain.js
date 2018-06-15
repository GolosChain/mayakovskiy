const W3CWebSocket = require('websocket').w3cwebsocket;
const logger = require('./Logger');

const SOCKET_TIMEOUT = 5000;
const BLOCK_GENERATION_AVERAGE_MS = 3000;

/**
 * Единый коннектор к блокчейну, позволяет получать данные удобныйм способом
 * через готовые асинхронные методы. Для работы использует публичную ноду
 * ws.golos.io.
 * Не требует создания экземпляра - все методы являются статик методами.
 */
class BlockChain {
    /**
     * Подключение к ноде.
     * @returns {Promise<null/null>}
     */
    static async connect() {
        this._resetListenersMeta();

        return new Promise((resolve, reject) => {
            this._socket = new W3CWebSocket('wss://ws.golos.io');
            this._makeEventHandlers(resolve, reject);
            this._socket.onmessage = this._messageHandler;
        });
    }

    /**
     * Отключение от ноды.
     * @returns {Promise<null/null>}
     */
    static async disconnect() {
        this._resetListenersMeta();

        return new Promise((resolve, reject) => {
            try {
                this._disconnectCallback = () => {
                    resolve();
                    delete this._disconnectCallback;
                };

                this._socket.close();
                delete this._socket;
            } catch (error) {
                delete this._disconnectCallback;
                reject();
            }
        });
    }

    /**
     * Позволяет получать данные каждого блока в реальном времени
     * начиная от блока в момент подключения.
     * @param {Function} callback Первый аргумент будет содержать данные.
     */
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

    /**
     * Позволяет получать транзакции в реальном времени
     * начиная от блока в момент подключения.
     * @param {Function} callback Первый аргумент будет содержать данные.
     */
    static eachTransactionRealTime(callback) {
        this.eachBlockRealTime(data => {
            data.transactions.forEach(transaction => callback(transaction));
        });
    }

    /**
     * Позволяет получать данные постов в реальном времени
     * начиная от блока в момент подключения.
     * @param {Function} callback Первый аргумент будет содержать данные.
     */
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

    /**
     * Позволяет получить номер последнего блока на данный момент времени.
     * @returns {Promise<number/Error>}
     */
    static async getCurrentBlockNumber() {
        const params = ['database_api', 'get_dynamic_global_properties', []];
        const request = this._makeRequestObject('call', params);
        const response = await this.sendOverJsonRpc(request);

        return response.result.head_block_number;
    }

    /**
     * Позволяет получить данные указанного блока.
     * @param {number} blockNumber Номер блока.
     * @returns {Promise<Object/Error>}
     */
    static async getBlockData(blockNumber) {
        const params = ['database_api', 'get_block', [blockNumber]];
        const request = this._makeRequestObject('call', params);
        const response = await this.sendOverJsonRpc(request);

        return response.result;
    }

    /**
     * Низкоуровневая отправка данных на ноду,
     * предполагает что уже назначен листенер на ответ
     * с соответствующим id.
     * @param {Object} data Сырой объект JSON RPC 2.0
     * @returns {Promise<Object/null>}
     */
    static sendOverJsonRpc(data) {
        return new Promise((resolve, reject) => {
            this._socket.send(JSON.stringify(data));

            this._listeners[data.id] = response => {
                /* do not add any logic here -
                   called after socket timeout too,
                   but promise freeze after reject call,
                   used for avoid unknown id */
                resolve(response);
            };

            setTimeout(() => {
                if (this._listeners[data.id]) {
                    logger.error('BlockChain socket timeout.');
                    reject();
                }
            }, SOCKET_TIMEOUT);
        });
    }

    static _makeEventHandlers(resolve, reject) {
        this._socket.onerror = error => {
            logger.error(`BlockChain socket error - ${error}`);
            reject(); // call on each error not a bug
        };

        this._socket.onopen = () => {
            logger.info('BlockChain socket connection established.');
            resolve();
        };

        this._socket.onclose = () => {
            this._disconnectCallback && this._disconnectCallback();
            logger.info('BlockChain socket disconnected.');
        };
    }

    static _messageHandler(rawData) {
        let data = this._parseMessageData(rawData);

        if (!data) {
            return;
        }

        if (this._listeners[data.id]) {
            this._callListener(this._listeners[data.id], data);
            delete this._listeners[data.id];
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
        return ++this._lastListenerId;
    }

    static _resetListenersMeta() {
        this._listeners = {};
        this._lastListenerId = 0;
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
