const core = require('gls-core-service');
const stats = core.utils.statsClient;
const BasicMain = core.services.BasicMain;
const MongoDB = core.services.MongoDB;
const Registrator = require('./services/Registrator');
const Planner = require('./services/Planner');
const Liker = require('./services/Liker');
const env = require('./data/env');

/**
 * Основная точка входа.
 * Является сервисом с вложенными сервисами.
 * Запускает все остальные необходимые сервисы.
 * При выходе по Ctrl-C или иным подобным безопасным способом
 * пытается безболезненно остановить все вложенные сервисы.
 *
 * Дополнительная информация о проекте в целом, а также описание возможных
 * переменных окружения содержится в файлах Readme и Arch.pdf.
 */
class Main extends BasicMain {
    constructor() {
        super(stats, env);

        this.addNested(new MongoDB(), new Registrator());
        this._choosePlannerMode();
    }

    _choosePlannerMode() {
        switch (env.GLS_PLANNER_MODE) {
            case 'auto':
                this.addNested(new Planner(Liker));
                break;
            case 'manual':
                // TODO: -
                break;
            default:
                throw new Error('GLS_PLANNER_MODE is not valid or undefined');
        }
    }
}

module.exports = Main;
