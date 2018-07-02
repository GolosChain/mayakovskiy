// Описание переменных окружения смотри в Readme.
const env = process.env;

module.exports = {
    WIF: env.WIF,
    LOGIN: env.LOGIN,
    MIN_GOLOS_POWER: env.MIN_GOLOS_POWER || 0,
};
