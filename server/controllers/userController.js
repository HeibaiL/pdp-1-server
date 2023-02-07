const userService = require('../services/userService');
const fbService = require('../services/fbService');
const ApiError = require("../exceptions/api-error");
const tokenService = require("../services/tokenService");
const UserModel = require("../schemas/userSchema.js")

class UserController {
    async registerUser(req, res, next) {
        try {
            const userData = await userService.registerUser(req.body);
            res.cookie('refreshToken', userData.refreshToken, {httpOnly: false, maxAge: 30 * 24 * 60 * 1000})
            return res.json(userData);
        } catch (err) {
            next(err)
        }

    }

    async loginUser(req, res, next) {
        try {
            const userData = await userService.loginUser(req.body);
            res.cookie('refreshToken', userData.refreshToken, {httpOnly: false, maxAge: 30 * 24 * 60 * 1000})
            return res.json(userData);
        } catch (err) {
            next(err)
        }
    }

    async logoutUser(req, res) {
        const {refreshToken} = req.body;
        const user = await userService.logoutUser(refreshToken);
        res.clearCookie("refreshToken");
        return res.send(user);
    }

    async refresh(req, res, next) {
        const {refreshToken} = req.body;
        try {
            if (refreshToken) {
                const userData = await userService.refresh(refreshToken);
                res.cookie('refreshToken', userData.refreshToken, {httpOnly: false, maxAge: 30 * 24 * 60 * 1000})
                return res.json(userData);
            }
        } catch (ex) {
            next(ex)
        }

    }

    async fbLogin(req, res, next) {
        const data = req.body;
        try {
            const userAccessToken = await fbService.exchangeCodeForAccessToken(data.code);
            const appAccessToken = await fbService.getAppAccessToken()
            const userData = await fbService.validateFbToken(userAccessToken.access_token, appAccessToken.access_token);

        } catch (ex) {
            next(ex)
        }
    }

    async googleLogin(req, res, next) {
        try {
            const {token} = req.body;
            const data = await userService.googleAuth(token);
            const user = await userService.findOne({login: data.login});

            let userData;
            if (!user) {
                userData = await userService.registerUser(data, "google");
            } else {
                userData = await userService.loginUser(user, "google");
            }
            res.cookie('refreshToken', userData.refreshToken, {httpOnly: false, maxAge: 30 * 24 * 60 * 1000})
            return res.json(userData);
        } catch (ex) {
            next(ex)
        }
    }

    async githubLogin(req, res, next) {
        const {code} = req.body;
        try {
            const data = await userService.getGitHubUserData(code);

            const user = await userService.findOne({login: data.login})
            let userData;

            if (!user) {
                userData = await userService.registerUser(data, "google");
            } else {
                userData = await userService.loginUser(user, "google");
            }
            res.cookie('refreshToken', userData.refreshToken, {httpOnly: false, maxAge: 30 * 24 * 60 * 1000})
            return res.json(userData);
        } catch (ex) {
            next(ex)
        }
    }

    async getProfile(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.json(null)
        }

        const tokenValid = await tokenService.validateToken(authHeader.split(" ")[1]);
        if (tokenValid) {
            const user = await userService.getProfileByToken(authHeader)
            if (user) {
                res.json(user)
            }
        } else {
            next(new Error("error"))
        }
    }

    async onGetAllUsers(req, res) {
        try {
            const users = await UserModel.getUsers();
            return res.status(200).json({success: true, users});
        } catch (error) {
            return res.status(500).json({success: false, error: error})
        }
    }

    async onGetUserById(req, res) {
        try {
            const user = await UserModel.getUserById(req.params.id);
            return res.status(200).json({success: true, user});
        } catch (error) {
            return res.status(500).json({success: false, error: error})
        }
    }

    async onCreateUser(req, res) {
        try {
            const validation = makeValidation(types => ({
                payload: req.body,
                checks: {
                    firstName: {type: types.string},
                    lastName: {type: types.string},
                    type: {type: types.enum, options: {enum: USER_TYPES}},
                }
            }));
            if (!validation.success) return res.status(400).json({...validation});

            const {firstName, lastName, type} = req.body;
            const user = await UserModel.createUser(firstName, lastName, type);
            return res.status(200).json({success: true, user});
        } catch (error) {
            return res.status(500).json({success: false, error: error})
        }
    }

    async onDeleteUserById(req, res) {
        try {
            const user = await UserModel.deleteByUserById(req.params.id);
            return res.status(200).json({
                success: true,
                message: `Deleted a count of ${user.deletedCount} user.`
            });
        } catch (error) {
            return res.status(500).json({success: false, error: error})
        }
    }

}

module.exports = new UserController();