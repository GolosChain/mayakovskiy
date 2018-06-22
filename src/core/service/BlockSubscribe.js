const WebSocket = require('ws');
const env = require('../Env');
const logger = require('../Logger');
const BasicService = require('../service/Basic');

// TODO remove after golos-js implement this methods
const MAGIC_SUBSCRIBE_CALL =
    '{"id":1,"jsonrpc":"2.0","method":"call","params":["database_api","set_block_applied_callback",[0]]}';

class BlockSubscribe extends BasicService {
    constructor() {
        super();

        this._alive = false;
    }

    static extractBlockNum(blockHash) {
        return parseInt(blockHash.slice(0, 8), 16);
    }

    async start(callback) {
        this._socket = new WebSocket(env.BLOCKCHAIN_NODE_ADDRESS);

        this._makeSocketHandlers();
        this._startSocketWatchDog();
    }

    async stop() {
        this._socket.terminate();
    }

    async blockBy(blockNum) {
        // TODO -
    }

    _makeSocketHandlers() {
        this._socket.on('error', this._handleError);
        this._socket.on('message', raw => {
            let response;

            this._alive = true;

            try {
                response = JSON.parse(raw.data);
            } catch (error) {
                this._handleError(error);
                return;
            }

            if (!response.result) {
                this._handleError('Empty message result');
                return;
            }

            return callback(response.result);
        });
        this._socket.on('open', () => {
            logger.info('BlockSubscribe websocket connection established.');
            this._socket.send(MAGIC_SUBSCRIBE_CALL);
        });
    }

    _startSocketWatchDog() {
        const dog = setInterval(() => {
            if (!this._alive) {
                clearInterval(dog);
                this._handleError('Request timeout');
            }

            this._alive = false;
        }, env.BLOCKCHAIN_SUBSCRIBE_TIMEOUT / 2);
    }

    _handleError(error) {
        logger.error(`BlockSubscribe websocket error - ${error}`);
        process.exit(1);
    }
}

module.exports = BlockSubscribe;
