const moment = require('moment');
const env = require('./Env');

/**
 * //
 */
class Moments {
    /**
     * //
     * @returns {moment.Moment}
     */
    static get currentDayStart() {
        return moment()
            .utc()
            .startOf('day')
            .hour(this._dayStart);
    }

    /**
     * //
     * @returns {moment.Moment}
     */
    static get lastDayStart() {
        return this.currentDayStart.subtract(1, 'day');
    }

    /**
     * //
     * @returns {number}
     */
    static get remainedToNextDay() {
        const diff = moment()
            .utc()
            .add(this._dayStart * 2, 'hours');

        return moment()
            .utc()
            .startOf('day')
            .hour(this._dayStart)
            .add(1, 'day')
            .diff(diff);
    }

    /**
     * //
     * @returns {moment.Duration}
     */
    static get oneDay() {
        return moment.duration(1, 'day');
    }

    static get _dayStart() {
        return env.DAY_START;
    }
}

module.exports = Moments;
