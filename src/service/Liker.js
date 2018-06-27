const golos = require('golos-js');
const env = require('../Env');
const BasicService = require('../core/service/Basic');
const logger = require('../core/Logger');
const stats = require('../core/Stats').client;
const Post = require('../model/Post');

/**
 * Сервис непосредственного поощрения пользователей лайками.
 * Не содержит своей системы восстановления после сбоев т.к.
 * эту роль выполняет сервис Planner, делающий все необходимые действия.
 * Абстракная схема принципа работы представлена в файле Arch.pdf.
 *
 * Сервис работает ровно сутки, проставляя лайки по определенному ранее плану.
 * План содержит моменты запуска Like machine, которая расставляет лайки с
 * указанной силой соответствующим постам согласно загруженному плану.
 */
class Liker extends BasicService {
    /**
     * Конструктор класса.
     * @param {Model} plan Модель вида Plan для исполнения сервисом.
     */
    constructor(plan) {
        super();

        this._plan = plan;
    }

    /**
     * Запуск.
     * @returns {Promise<void>} Промис без экстра данных.
     */
    async start() {
        this.startLoop(0, this._plan.step);
    }

    /**
     * Бережная остановка, которая останавливает итератор, но позволяет
     * отработать итерации, которая находится в процессе выполнения.
     * @returns {Promise<void>} Промис без экстра данных.
     */
    async stop() {
        this.stopLoop();
    }

    /**
     * Итерация, запускаемая каждый промежуток времени, определенный планом.
     * Производит непосредственно поощрение пользователя лайком его поста.
     * Пост помечается и в будущем не обрабатывается ни в каком виде.
     * По факту отсутствия не помеченных постов помечает сам план как
     * завершенный и заверщает итератор, по сути завершая сам сервис.
     * Ручной запуск метода в обычном кейсе не предполагается.
     * @returns {Promise<void>} Промис без экстра данных.
     */
    async iteration() {
        const record = await this._getTarget();

        if (!record) {
            this.stopLoop();
            await this._markPlanAsDone();
            this.done();

            return;
        }

        const { id, author, permlink } = record;
        const targetMsg = `Target - ${author} [${permlink}] (id: ${id})`;

        logger.log(`It's Like machine time! ;) ${targetMsg}`);

        await this._likePost(record);
        await this._markPostAsLiked(record);

        stats.increment('make_like');
    }

    async _getTarget() {
        const query = { plan: this._plan._id, processed: false };
        const projection = { author: true, permlink: true };

        return await Post.findOne(query, projection);
    }

    async _likePost(record) {
        try {
            const timer = new Date();

            await golos.broadcast.voteAsync(
                env.WIF,
                env.LOGIN,
                record.author,
                record.permlink,
                this._plan.weight
            );

            stats.timing('like_request', new Date() - timer);
        } catch (error) {
            stats.increment('make_like_error');
            logger.error(`Like Machine request error - ${error}`);
            process.exit(1);
        }
    }

    async _markPostAsLiked(record) {
        record.processed = true;

        await record.save();
    }

    async _markPlanAsDone() {
        const id = this._plan._id;

        // Filter for really high load
        if (this.isDone()) {
            return;
        }

        this._plan.done = true;

        await this._plan.save();

        stats.increment('plan_done');
        logger.info(`Plan ${id} is done!`);
    }
}

module.exports = Liker;
