const golos = require('golos-js');
const BasicService = require('../core/service/Basic');
const BlockSubscribe = require('../core/service/BlockSubscribe');
const Moments = require('../core/Moments');
const logger = require('../core/Logger');
const stats = require('../core/Stats').client;
const Post = require('../model/Post');

/**
 * Сервис регистрации новых постов со встроенной фильтрацией.
 * Содержит систему самовосстановления после сбоев.
 * Абстракная схема принципа работы представлена в файле Arch.pdf.
 *
 * Сервис работает постоянно, на каждый новый блок собирая данные
 * по опубликованным статьям.
 * Данные проверяются на факт постинга с официального сайта или приложения
 * golos.io, а также на тот факт что пост от конкретного пользователя был
 * первым за сутки, не подходящие данные не сохраняются.
 * Дополнительно предусмотрена установка валидаторов на проверку попыток
 * совершения мошеннических действий. Валидаторы фильтруют неподходящие данные,
 * не пуская их в список для лайкинга.
 * Валидаторы могут быть удаленными сервисами.
 */
class Registrator extends BasicService {
    constructor() {
        super();

        this._syncedBlockNum = 0;
        this._syncStack = [];
    }

    /**
     * Запуск с автоматической проверкой на факт сбоев.
     * Все пропущенные за время сбоя блоки будут проверенны.
     * @returns {Promise<void>} Промис без экстра данных.
     */
    async start() {
        await this.restore();

        const subscribe = new BlockSubscribe();

        this.addNested(subscribe);

        await subscribe.start(data => {
            this._trySync(data);
            this._handleBlock(data);
        });
    }

    /**
     * Остановка сервиса с остановкой вложенных сервисов.
     * @returns {Promise<void>} Промис без экстра данных.
     */
    async stop() {
        await this.stopNested();
    }

    /**
     * Самовосстановление сервиса.
     * Ручной запуск в обычном кейсе не предполагается,
     * т.к. автоматически вызывается при запуске сервиса.
     * Все пропущенные за время сбоя блоки будут проверенны.
     * @returns {Promise<void>} Промис без экстра данных.
     */
    async restore() {
        const timer = new Date();
        const postAtLastBlock = await Post.findOne(
            {},
            { blockNum: true, _id: false },
            { sort: { blockNum: -1 } }
        );

        if (postAtLastBlock) {
            this._syncedBlockNum = postAtLastBlock.blockNum;
        }

        stats.timing('last_block_num_search', new Date() - timer);
    }

    _trySync(data) {
        const previousHash = data.previous;
        const previousBlockNum = parseInt(previousHash.slice(0, 8), 16);

        this._currentBlockNum = previousBlockNum + 1;

        if (!this._syncedBlockNum) {
            logger.log(
                'Empty Post collection,',
                `then start sync from block ${previousBlockNum}`
            );
            this._syncedBlockNum = previousBlockNum;
        }

        if (previousBlockNum !== this._syncedBlockNum) {
            this._populateSyncQueue();
            this._sync();
        }

        this._syncedBlockNum = this._currentBlockNum;
    }

    _populateSyncQueue() {
        const from = this._syncedBlockNum + 1;
        const to = this._currentBlockNum - 1;

        for (let i = from; i < to; i++) {
            this._syncStack.push(i);
        }
    }

    _sync() {
        if (this._syncStack.length === 0) {
            return;
        }

        // async lightweight step-by-step data sync strategy
        const blockNum = this._syncStack.pop();
        const timer = new Date();

        logger.log(`Restore missed registration for block - ${blockNum}`);

        golos.api
            .getBlockAsync(blockNum)
            .then(data => {
                stats.timing('block_restore', new Date() - timer);
                setImmediate(this._sync.bind(this));
                this._handleBlock(data);
            })
            .catch(this._handleBlockError.bind(this));
    }

    _handleBlock(data) {
        data.transactions.forEach(async transaction => {
            const posts = this._parsePosts(transaction);

            for (let post of Object.values(posts)) {
                await this._checkAndRegister(post);
            }
        });
    }

    _parsePosts(transaction) {
        const posts = {};
        const commentOptions = {};

        transaction.operations.forEach(operation => {
            const type = operation[0];
            const body = operation[1];

            if (type === 'comment' && body.parent_author === '') {
                posts[body.permlink] = body;
            }

            if (type === 'comment_options') {
                commentOptions[body.permlink] = body;
            }
        });

        for (let permlink of Object.keys(commentOptions)) {
            if (posts[permlink]) {
                posts[permlink].commentOptions = commentOptions[permlink];
            }
        }

        return posts;
    }

    async _checkAndRegister(post) {
        if (!(await this._basicValidation(post))) {
            return;
        }

        if (!(await this._remoteValidation(post))) {
            return;
        }

        await this._register(post);
    }

    async _basicValidation(post) {
        if (!this._validateBeneficiaries(post)) {
            return false;
        }

        if (!(await this._validatePostCount(post))) {
            return false;
        }

        return true;
    }

    _validateBeneficiaries(post) {
        let valid = false;

        if (!post.commentOptions) {
            return valid;
        }

        const extensions = post.commentOptions.extensions;

        extensions.forEach(extension => {
            extension[1].beneficiaries.forEach(target => {
                if (target.account === 'golosio' && target.weight === 1000) {
                    valid = true;
                }
            });
        });

        return valid;
    }

    async _validatePostCount(post) {
        const dayStart = Moments.currentDayStart;
        const request = { author: post.author, date: { $gt: dayStart } };
        const count = await Post.find(request).count();

        return count === 0;
    }

    async _remoteValidation(post) {
        // no remote validators for now
        return true;
    }

    async _register(post) {
        const timer = new Date();
        const { author, permlink } = post;
        const blockNum = this._currentBlockNum;
        const model = new Post({ author, permlink, blockNum });

        await model.save();

        logger.log(`Register post: ${author} - ${permlink}`);
        stats.timing('post_registration', new Date() - timer);
    }

    _handleBlockError(error) {
        stats.increment('block_registration_error');
        logger.error(`Load block error - ${error}`);
        process.exit(1);
    }
}

module.exports = Registrator;
