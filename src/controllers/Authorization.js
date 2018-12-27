const core = require('gls-core-service');
const BasicController = core.controllers.Basic;
const Authorizations = require('../models/Authorization');

class Authorization extends BasicController {
    constructor({ connector, adminUsername }) {
        super({ connector });
        this.adminUsername = adminUsername;
    }

    _checkAdmin({ user }) {
        if (user !== this.adminUsername) {
            throw {
                code: 403,
                message: 'Not an admin',
            };
        }
    }
    async getAuthorizationsList({ user }) {
        this._checkAdmin({ user });
        return await Authorizations.find({});
    }

    async hasModerationAccess({ user }) {
        try {
            const authorization = await this.getRole({ user });
            const role = authorization.result.role;

            switch (role) {
                case 'admin':
                case 'moderator':
                    return true;
                default:
                    return false;
            }
        } catch (error) {
            if (error.code === 404) {
                return false;
            } else throw error;
        }
    }

    async getRole({ user }) {
        if (user === this.adminUsername) {
            return { result: { role: 'admin', user } };
        }
        const role = await Authorizations.findOne({ username: user });

        if (!role) {
            throw {
                code: 404,
                message: 'No such user',
            };
        }
        return role;
    }

    async revokeAccess({ user, targetUsername }) {
        this._checkAdmin({ user });
        return await Authorizations.remove({ username: targetUsername });
    }

    async updateRole({ user, targetUsername, role }) {
        this._checkAdmin({ user });
        return await Authorizations.update({ username: targetUsername }, { $set: { role: role } });
    }

    async _checkAuthorizationExists({ targetUsername, role }) {
        const authorization = await Authorizations.findOne({ username: targetUsername, role });
        return !!authorization;
    }

    async grantAccess({ user, targetUsername, role = 'moderator' }) {
        this._checkAdmin({ user });

        const alreadyExists = await this._checkAuthorizationExists({ targetUsername, role });

        if (!alreadyExists) {
            return await Authorizations.create({ username: targetUsername, role });
        } else {
            return await Authorizations.findOne({
                username: targetUsername,
                role,
            });
        }
    }
}

module.exports = Authorization;
