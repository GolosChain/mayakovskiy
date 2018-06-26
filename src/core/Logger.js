require('colors');
const moment = require('moment');

class Logger {
    static log() {
        this._log('[log]', arguments, 'grey');
    }

    static info() {
        this._log('[info]', arguments, 'blue');
    }

    static error() {
        this._log('[error]', arguments, 'red');
    }

    static _log(prefix, data, color) {
        console.log.apply(console, [
            this._now(),
            `<${process.pid}>`,
            prefix[color],
            ...data,
        ]);
    }

    static _now() {
        return moment().format('YYYY-MM-DD HH:mm');
    }
}

module.exports = Logger;
