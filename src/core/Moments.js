const moment = require('moment');

class Moments {
    static get currentDayStart() {
        return moment()
            .utc()
            .startOf('day')
            .hour(this._dayStart);
    }

    static get lastDayStart() {
        return this.currentDayStart.subtract(1, 'day');
    }

    static get remainedToNextDay() {
        return moment()
            .startOf('day')
            .hour(this._dayStart)
            .add(1, 'day')
            .diff(moment());
    }

    static get oneDay() {
        return moment.duration(1, 'day');
    }

    static get _dayStart() {
        return process.env.DAY_START || 3;
    }
}

module.exports = Moments;
