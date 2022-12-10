const userService = require('../services/userService');
const fbService = require('../services/fbService');
const ApiError = require("../exceptions/api-error");
const tokenService = require("../services/tokenService");

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

    async refresh(req, res, next){
        const {refreshToken} = req.body;
        try{
            if(refreshToken){
                const userData = await userService.refresh(refreshToken);
                res.cookie('refreshToken', userData.refreshToken, {httpOnly: false, maxAge: 30 * 24 * 60 * 1000})
                return res.json(userData);
            }
        }catch(ex){
            next(ex)
        }

    }
    async fbLogin(req, res, next) {
        const data = req.body;
        try {
            const userAccessToken = await fbService.exchangeCodeForAccessToken(data.code);
            const appAccessToken = await fbService.getAppAccessToken()
            const userData = await fbService.validateFbToken(userAccessToken.access_token, appAccessToken.access_token);

        }catch(ex){
            next(ex)
        }
    }
    async googleLogin(req, res, next){
        try {
            const {token} = req.body;
            const data = await userService.googleAuth(token);
            const user = await userService.findOne({login: data.login});

            let userData;
            if(!user){
               userData = await userService.registerUser(data, "google");
            }else{
                userData = await userService.loginUser(user, "google");
            }
            res.cookie('refreshToken', userData.refreshToken, {httpOnly: false, maxAge: 30 * 24 * 60 * 1000})
            return res.json(userData);
        }catch(ex){
            next(ex)
        }
    }
    async githubLogin(req, res, next){
        const {code} = req.body;
        try {
            const data = await userService.getGitHubUserData(code);

            const user = await userService.findOne({login: data.login})
            let userData;

            if(!user){
                userData = await userService.registerUser(data, "google");
            }else{
                userData = await userService.loginUser(user, "google");
            }
            res.cookie('refreshToken', userData.refreshToken, {httpOnly: false, maxAge: 30 * 24 * 60 * 1000})
            return res.json(userData);
        }catch(ex){
            next(ex)
        }
    }

    async getProfile(req, res, next) {
        const authHeader = req.headers.authorization;
        if(!authHeader){
           return  res.json(null)
        }

        const tokenValid = await tokenService.validateToken(authHeader.split(" ")[1]);
        if(tokenValid){
            const user = await userService.getProfileByToken(authHeader)
            if(user) {
                res.json(user)
            }
        }else{
            next(new Error("error"))
        }


    }

}

module.exports = new UserController();