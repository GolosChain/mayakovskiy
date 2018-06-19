const moment = require('moment');
const AbstractService = require('../core/AbstractService');
const BlockChainMocks = require('../core/BlockChainMocks');
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
        const offset = process.env.DAY_START || 3;
        const dayEdge = moment()
            .utc()
            .startOf('day')
            .hour(offset);
        const request = { author: post.author, date: { $gt: dayEdge } };
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
        });

        await model.save();
    }
}

module.exports = RegistratorService;
