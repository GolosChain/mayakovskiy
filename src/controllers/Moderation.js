const core = require('gls-core-service');
const BasicController = core.controllers.Basic;
const Post = require('../models/Post');
class Moderation extends BasicController {
    async listPosts() {
        return await Post.find({
            approved: null,
        });
    }
    async denyPosts({ postIds }) {
        return await this._markPostsApproval(postIds, false);
    }

    async approvePosts({ postIds }) {
        return await this._markPostsApproval(postIds, true);
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
