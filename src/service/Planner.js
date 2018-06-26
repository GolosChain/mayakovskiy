const BasicService = require('../core/service/Basic');
const logger = require('../core/Logger');
const Moments = require('../core/Moments');
const stats = require('../core/Stats').client;
const Post = require('../model/Post');
const Plan = require('../model/Plan');

// BlockChain constants
const THE_100_PERCENT_DECIMALS = 100 * 100;
const VOTE_BY_DAY_WITH_MAX_WEIGHT = 40;
const DAY_VOTE_WEIGHT = THE_100_PERCENT_DECIMALS * VOTE_BY_DAY_WITH_MAX_WEIGHT;

/**
 * Сервис-планировщик занимающийся составлением планов поощрения пользователей.
 * Содержит систему самовосстановления после сбоев.
 * Абстракная схема принципа работы представлена в файле Arch.pdf.
 *
 * Сервис запускается раз в сутки, агрегирует необходимые данные,
 * составляет план на день и запускает Liker.
 * В процессе составления плана определяется необходимая сила голоса,
 * интервалы голосования и список тех, за кого необходимо проголосовать.
 * Также предусмотрена возможность расширения логики агрегирования и
 * планирования в будущем.
 */
class Planner extends BasicService {
    /**
     * Конструктор класса.
     * @param {Liker} liker Класс сервиса Liker, проброс через параметр
     * необходим для явного указания связи двух сервисов.
     */
    constructor(liker) {
        super();

        this._liker = liker;
    }

    /**
     * Запуск с автоматической проверкой на факт сбоев.
     * Планы, которые прервались в процессе составления будут удалены.
     * Планы, которые были исполнены частично будут запущены с места
     * остановки.
     * @returns {Promise<void>} Промис без экстра данных.
     */
    async start() {
        await this.restore();

        this.startLoop(Moments.remainedToNextDay, Moments.oneDay);
    }

    /**
     * Остановка сервиса вместе со всеми запущенными сервисами Liker
     * и другими иными вложенными сервисами.
     * @returns {Promise<void>} Промис без экстра данных.
     */
    async stop() {
        this.stopLoop();

        logger.info('Stop nested Liker services');
        await this.stopNested();
    }

    /**
     * Самовосстановление сервиса.
     * Ручной запуск в обычном кейсе не предполагается,
     * т.к. автоматически вызывается при запуске сервиса.
     * Планы, которые прервались в процессе составления будут удалены.
     * Планы, которые были исполнены частично будут запущены с места
     * остановки.
     * @returns {Promise<void>} Промис без экстра данных.
     */
    async restore() {
        await this._dropCorruptedPlans();
        await this._restartPendingPlans();
    }

    /**
     * Итерация составления плана, за одну итерацию составляется 1 план.
     * Ручной запуск в обычном кейсе не предполагается,
     * т.к. автоматически вызывается каждые сутки в назначенное время.
     * @returns {Promise<void>} Промис без экстра данных.
     */
    async iteration() {
        logger.log('Make new plan...');

        const data = await this._aggregateData();

        if (data.length === 0) {
            logger.error('No posts from golos.io?!');
            return;
        }

        const plan = await this._makePlan(data);
        const liker = new this._liker(plan);

        this.addNested(liker);

        logger.log('Making plan done, start new Liker');

        await liker.start();

        stats.increment('plan_generated');
    }

    async _aggregateData() {
        const timer = new Date();
        const data = (await Post.find(
            {
                plan: null,
            },
            {
                _id: true,
            }
        )).map(doc => doc._id);

        stats.timing('plan_data_aggregation', new Date() - timer);

        return data;
    }

    async _makePlan(data) {
        const timer = new Date();
        const count = data.length;
        const step = Math.floor(Moments.oneDay / count);
        let weight = Math.floor(DAY_VOTE_WEIGHT / count);

        // less then 40 posts
        if (weight > THE_100_PERCENT_DECIMALS) {
            weight = THE_100_PERCENT_DECIMALS;
        }

        const plan = new Plan({ step, weight });

        await plan.save();

        for (let id of data) {
            const update = { $set: { plan: plan._id } };
            await Post.findByIdAndUpdate(id, update);
        }

        plan.processed = true;
        plan.save();

        stats.timing('plan_saving_with_update_posts', new Date() - timer);

        return plan;
    }

    async _dropCorruptedPlans() {
        const corruptedPlans = await Plan.find(
            { processed: false },
            { _id: true }
        );

        for (let plan of corruptedPlans) {
            const posts = await Post.find({ plan: plan._id });

            for (let post of posts) {
                post.plan = null;

                await post.save();
            }

            logger.log(`Drop corrupted plan - ${plan._id}`);

            plan.remove();
        }

        stats.increment('corrupted_plans_drop');
    }

    async _restartPendingPlans() {
        const pendingPlans = await Plan.find({ processed: true, done: false });

        for (let plan of pendingPlans) {
            const liker = new this._liker(plan);

            this.addNested(liker);

            logger.log(`Restart pending plan - ${plan._id}`);

            await liker.start();
        }

        stats.increment('pending_plans_start');
    }
}

module.exports = Planner;
