const core = require('gls-core-service');
const BasicController = core.controllers.Basic;
const Authorizations = require('../models/Authorizations');
class Authorization extends BasicController {
    constructor({ connector, adminUsername }) {
        super({ connector });
        this.adminUsername = adminUsername;
    }

    _checkAdmin({ username }) {
        if (username !== this.adminUsername) {
            throw {
                code: 403,
                message: 'Not an admin',
            };
        }
    }
    async getAuthorizationsList({ username }) {
        this._checkAdmin({ username });
        return await Authorizations.find({});
    }

    async getRole({ username }) {
        if (username === this.adminUsername) {
            return { role: 'admin', username };
        }
        const role = await Authorizations.findOne({ username: username });

        if (!role) {
            throw {
                code: 404,
                message: 'No such user',
            };
        }
        return role;
    }

    async revokeAccess({ username, targetUsername }) {
        this._checkAdmin({ username });
        return await Authorizations.remove({ username: targetUsername });
    }

    async updateRole({ username, targetUsername, role }) {
        this._checkAdmin({ username });
        return await Authorizations.update({ username: targetUsername }, { $set: { role: role } });
    }

    async _checkAuthorizationExists({ targetUsername, role }) {
        const authorization = await Authorizations.findOne({ username: targetUsername, role });
        return !!authorization;
    }

    async grantAccess({ username, targetUsername, role = 'moderator' }) {
        this._checkAdmin({ username });
        const alreadyExists = await this._checkAuthorizationExists({ targetUsername, role });
        if (!alreadyExists) {
            return await Authorizations.create({ username: targetUsername, role: role });
        } else {
            return await Authorizations.findOne({
                username: targetUsername,
                role,
            });
        }
    }
}

module.exports = Authorization;
