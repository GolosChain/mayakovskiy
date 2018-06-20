const BasicService = require('../core/BasicService');
const BlockChainMocks = require('../core/BlockChainMocks');
const Moments = require('../core/Moments');
const logger = require('../core/Logger');
const Post = require('../model/Post');

class Registrator extends BasicService {
    async start() {
        await this.restore();

        BlockChainMocks.eachBlock(data => {
            this._trySync(data);
            this._blockHandler(data);
        });
    }

    async restore() {
        const postAtLastBlock = await Post.findOne(
            {},
            { blockNum: true, _id: false },
            { sort: { blockNum: -1 } }
        );

        if (postAtLastBlock) {
            this._syncedBlockNum = postAtLastBlock.blockNum;
        } else {
            this._syncedBlockNum = 0;
        }
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
            this._sync();
        }
    }

    _sync() {
        // TODO -
    }

    _blockHandler(data) {
        data.transactions.forEach(async transaction => {
            const posts = this._parsePosts(transaction);

            for (let postKey in posts) {
                await this._checkAndRegister(posts[postKey]);
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

        for (let permlink in commentOptions) {
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
        let model = new Post({
            author: post.author,
            permlink: post.permlink,
            blockNum: this._currentBlockNum,
        });

        await model.save();
    }
}

module.exports = Registrator;
