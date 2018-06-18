const AbstractService = require('../core/AbstractService');
const BlockChainMocks = require('../core/BlockChainMocks');
const logger = require('../core/Logger');
const Post = require('../model/Post');

class RegistratorService extends AbstractService {
    async start() {
        await this.restore();

        BlockChainMocks.eachBlock(data => {
            data.transactions.forEach(async transaction => {
                const posts = this._parsePosts(transaction);

                for (let postKey in posts) {
                    await this._checkAndRegister(posts[postKey]);
                }
            });
        });
    }

    async restore() {
        // TODO restore from block chain
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
        let isValid;

        isValid = this._basicValidation(post);

        if (!isValid) return;

        isValid = this._extraValidation(post);

        if (!isValid) return;

        try {
            isValid = await this._remoteValidation(post);
        } catch (error) {
            logger.error(`Remote validation failed - ${error}`);
            isValid = false;
        }

        if (!isValid) return;

        await this._register(post);
    }

    _basicValidation(post) {
        let isBeneficiariesOk = false;

        if (!post.commentOptions) {
            return isBeneficiariesOk;
        }

        const extensions = post.commentOptions.extensions;

        extensions.forEach((extension) => {
            extension[1].beneficiaries.forEach(target => {
                if (target.account === 'golosio' && target.weight === 1000) {
                    isBeneficiariesOk = true;
                }
            });
        });

        return isBeneficiariesOk;
    }

    _extraValidation(post) {
        // no extra validators for now
        return true;
    }

    _remoteValidation(post) {
        // no remote validators for now
        return Promise.resolve(true);
    }

    async _register(post) {
        let model = new Post({
            author: post.author,
            permlink: post.permlink
        });

        await model.save();
    }
}

module.exports = RegistratorService;
