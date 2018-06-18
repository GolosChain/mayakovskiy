// TODO remove after golos-js implement this methods

const WS = require('ws');

module.exports.eachBlock = callback => {
    const ws = new WS('wss://ws.golos.io');

    ws.onopen = () => {
        ws.send(
            '{"id":1,"jsonrpc":"2.0","method":"call","params":["database_api","set_block_applied_callback",[0]]}'
        );
        ws.onmessage = raw => {
            return callback(JSON.parse(raw.data).result);
        };
    };
};
