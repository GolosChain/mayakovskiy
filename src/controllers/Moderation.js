const core = require('gls-core-service');
const BasicController = core.controllers.Basic;
const Post = require('../models/Post');

class Moderation extends BasicController {
    async getPosts({ user }) {
        if (await this.connector.authorization.hasModerationAccess({ user })) {
            return await Post.find({
                approved: null,
            });
        } else
            throw {
                code: 403,
                message: 'Access denied',
            };
    }
    async denyPosts({ postIds, user }) {
        if (await this.connector.authorization.hasModerationAccess({ user })) {
            return await this._markPostsApproval(postIds, false);
        } else
            throw {
                code: 403,
                message: 'Access denied',
            };
    }

    async approvePosts({ postIds, user }) {
        if (await this.connector.authorization.hasModerationAccess({ user })) {
            return await this._markPostsApproval(postIds, true);
        } else
            throw {
                code: 403,
                message: 'Access denied',
            };
    }

    async _markPostsApproval(postIds, approved = false) {
        const approvalRequests = [];
        for (let id of postIds) {
            const update = {
                $set: {
                    processed: true,
                    approved,
                },
            };
            approvalRequests.push(Post.findByIdAndUpdate(id, update));
        }

        return await Promise.all(approvalRequests);
    }
}

module.exports = Moderation;
