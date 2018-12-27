const core = require('gls-core-service');
const stats = core.utils.statsClient;
const BasicMain = core.services.BasicMain;
const MongoDB = core.services.MongoDB;
const Registrator = require('./services/Registrator');
const AutoPlanner = require('./services/AutoPlanner');
const ManualPlanner = require('./services/ManualPlanner');
const Liker = require('./services/Liker');
const Connector = require('./services/Connector');
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

    _getAuthorization() {
        const admin = env.GLS_ADMIN_USERNAME;

        if (!admin) {
            throw new Error('GLS_ADMIN_USERNAME is not set');
        }
        return admin;
    }

    _choosePlannerMode() {
        switch (env.GLS_PLANNER_MODE) {
            case 'auto':
                this.addNested(new AutoPlanner(Liker));
                break;

            case 'manual':
                const adminUsername = this._getAuthorization();
                const manualPlanner = new ManualPlanner(Liker);

                this.addNested(
                    new Connector({
                        manualPlanner,
                        adminUsername,
                    })
                );
                break;

            default:
                throw new Error('GLS_PLANNER_MODE is not valid or undefined');
        }
        this._mode = env.GLS_PLANNER_MODE;
    }
}

module.exports = Main;
