const fetch = require('node-fetch');

class FbService {
    async exchangeCodeForAccessToken(code) {
        try {
            const link = `https://graph.facebook.com/v12.0/oauth/access_token?client_id=${process.env.FB_CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URL}&client_secret=${process.env.FB_APP_SECRET}&code=${code}`
            const res =  await fetch(link);
            return res.json()
        }catch(err){
            throw err
        }
    }
    async validateFbToken(inputToken, accessToken){

            const link = `https://graph.facebook.com/debug_token?input_token=${inputToken}&access_token=${accessToken}`
            let res = await fetch(link);
            res = await res.json()
            if(res.data.error){
                throw new Error('Token validation failed')
            }
            return res
    }
    async getAppAccessToken(){
        try {
            const link = `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FB_CLIENT_ID}&client_secret=${process.env.FB_APP_SECRET}&grant_type=client_credentials`
            const res = await fetch(link);
            return res.json()
        }catch(ex){
            throw ex
        }
    }


}

module.exports = new FbService();