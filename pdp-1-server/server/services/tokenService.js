const jwt = require('jsonwebtoken');
const {Token} = require('../schemas/tokenSchema');
const ApiError = require('../exceptions/api-error');

class TokenService {
    generateTokens(payload) {
        const {login, _id} = payload;
        const accessToken = jwt.sign({login, id: _id}, process.env.JWT_SECRET, {expiresIn: '20m'});
        const refreshToken = jwt.sign({login, id: _id}, process.env.JWT_SECRET, {expiresIn: "15d"});
        return {
            accessToken,
            refreshToken
        }
    }

    async saveRefreshToken(userId, refreshToken) {
        const tokenData = await Token.findOne({userId});
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save()
        }
        return Token.create({userId, refreshToken});
    }

     validateToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }

    async removeRefreshToken(refreshToken){
         return Token.findOneAndDelete({refreshToken})
    }

}

module.exports = new TokenService()