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
    GLS_ADMIN_USERNAME: env.GLS_ADMIN_USERNAME,
    GLS_MIN_POST_VALUE: Number(env.GLS_MIN_POST_VALUE) || 0,
    GLS_CONTENT_TYPE_DEFAULT: env.GLS_CONTENT_TYPE_DEFAULT || 'character',
    GLS_CONTENT_VALUE_DEFAULT: Number(env.GLS_CONTENT_VALUE_DEFAULT) || 1,
};

if (module.exports.GLS_PROHIBITED_TAGS === 'false') {
    module.exports.GLS_PROHIBITED_TAGS = false;
} else if (module.exports.GLS_PROHIBITED_TAGS) {
    module.exports.GLS_PROHIBITED_TAGS = module.exports.GLS_PROHIBITED_TAGS.split(' ');
}

if (module.exports.GLS_GOLOS_APP_NAME === 'false') {
    module.exports.GLS_GOLOS_APP_NAME = false;
}
