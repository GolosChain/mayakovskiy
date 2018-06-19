const moment = require('moment');

class Moments {
    static currentDayStart() {
        return moment()
            .utc()
            .startOf('day')
            .hour(this._dayStart);
    }

    static lastDayStart() {
        return this.currentDayStart().add(-1, 'days');
    }

    static get _dayStart() {
        return process.env.DAY_START || 3;
    }
}

module.exports = Moments;
