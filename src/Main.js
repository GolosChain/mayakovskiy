const logger = require('./core/Logger');
const BasicService = require('./core/service/Basic');
const Registrator = require('./service/Registrator');
const Planner = require('./service/Planner');
const Liker = require('./service/Liker');
const MongoDB = require('./core/service/MongoDB');
const stats = require('./core/Stats').client;

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
class Main extends BasicService {
    constructor() {
        super();

        this.addNested(new MongoDB(), new Registrator(), new Planner(Liker));
        this.stopOnExit();
    }

    /**
     * Запуск.
     * @returns {Promise<void>} Промис без экстра данных.
     */
    async start() {
        await this.startNested();
        stats.increment('main_service_start');
    }

    /**
     * Остановка с выходом с кодом 0.
     * @returns {Promise<void>} Промис без экстра данных.
     */
    async stop() {
        await this.stopNested();
        stats.increment('main_service_stop');
        process.exit(0);
    }
}

new Main().start().then(
    () => {
        logger.info('Main service started!');
    },
    error => {
        logger.error(`Main service failed - ${error}`);
        process.exit(1);
    }
);
