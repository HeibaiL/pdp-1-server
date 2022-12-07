const bcrypt = require('bcrypt');
const fetch = require("node-fetch");
const { OAuth2Client } = require('google-auth-library')

const {User} = require('../schemas/userSchema');
const tokenService = require('./tokenService');

const ApiError = require('../exceptions/api-error')


const client = new OAuth2Client(process.env.CLIENT_ID)

class UserService {
    async registerUser(userData, registerType) {
        const {name, login, password, birthday, picture} = userData;
        const dbUser = await User.findOne({login});

        if (dbUser) {
            throw ApiError.BadRequest("User with this email already exists")
        }

        const salt = await bcrypt.genSalt(12);
        let hashedPassword;
        if(!registerType) {
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const user = await User.create({name, login, birthday, password: hashedPassword || undefined, picture});
        const tokens = await tokenService.generateTokens({id: user._id, login})
        await tokenService.saveRefreshToken(user._id, tokens.refreshToken);

        return {user, ...tokens}
    }

    async loginUser(userData, loginType) {
        const {login, password} = userData;
        const user = await User.findOne({login});

        if (!user) {
            throw ApiError.BadRequest('User not found')
        }
        if(!loginType) {
            const isCorrectPassword = await bcrypt.compare(password, user.password);
            if (!isCorrectPassword) {
                throw ApiError.BadRequest('Wrong password')
            }
        }
        const tokens = tokenService.generateTokens(user);
        await tokenService.saveRefreshToken(user._id, tokens.refreshToken)
        return {user, ...tokens}
    }

    async logoutUser(refreshToken) {
        const tokenData = await tokenService.removeRefreshToken(refreshToken);
        return User.findOne({id: tokenData.userId});
    }

    async googleAuth(token){
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "107088676671-v4932rhnac80bc4a26etvd4ulncu47go.apps.googleusercontent.com"
        });
        const { name, email, picture } = ticket.getPayload();
        return {name, login:email, picture}
    }
    async getAccessTokenFromCode(code) {
        const res = await fetch(
            'https://github.com/login/oauth/access_token?' + new URLSearchParams({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                redirect_uri: 'http://localhost:3004',
                code,
            }));
        /**
         * GitHub returns data as a string we must parse.
         */
       const url = await res.text();
       const params = new URLSearchParams(url)

       return params.get("access_token")


        // { token_type, access_token, error, error_description }
        // if (parsedData.error) throw new Error(parsedData.error_description)
        // return parsedData.access_token;
    };

    async getGitHubUserData(code) {
       const token = await this.getAccessTokenFromCode(code)
        const res = await fetch('https://api.github.com/user',{
            headers: {
                Authorization: `token ${token}`,
            } }
        );
        const jsonData = await res.text();
        const userData = JSON.parse(jsonData)
        return {...userData, picture: userData.avatar_url}
    };

    async getProfileByRefreshToken(refresh){
        const token = refresh.split(' ')[1];
        if(!token){
            return null;
        }

        const validatedTokenData = tokenService.validateToken(token);
        console.log(validatedTokenData)
        if(!validatedTokenData){
            return next(ApiError.UnauthorizedError())
        }

        const user = await User.findOne({login: validatedTokenData.login})
        return user

    }
    async findOne(data){
        return  User.findOne({...data})
    }
}

module.exports = new UserService();