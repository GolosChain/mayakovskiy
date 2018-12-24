// Описание переменных окружения смотри в Readme.
const env = process.env;

module.exports = {
    GLS_WIF: env.GLS_WIF,
    GLS_LOGIN: env.GLS_LOGIN,
    GLS_MIN_GOLOS_POWER: Number(env.GLS_MIN_GOLOS_POWER) || 0,
    GLS_PROHIBITED_TAGS: env.GLS_PROHIBITED_TAGS || 'goldvoice',
    GLS_GOLOS_APP_NAME: env.GLS_GOLOS_APP_NAME || 'golos.io/0.1',
    // принимаемые значения: 'auto' (по умолчанию) ,'manual'
    GLS_PLANNER_MODE: env.GLS_PLANNER_MODE || 'auto',
    GLS_MIN_POST_LENGTH: Number(env.GLS_MIN_POST_LENGTH) || 0,
};

if (module.exports.GLS_PROHIBITED_TAGS === 'false') {
    module.exports.GLS_PROHIBITED_TAGS = false;
} else if (module.exports.GLS_PROHIBITED_TAGS) {
    module.exports.GLS_PROHIBITED_TAGS = module.exports.GLS_PROHIBITED_TAGS.split(' ');
}

if (module.exports.GLS_GOLOS_APP_NAME === 'false') {
    module.exports.GLS_GOLOS_APP_NAME = false;
}
