import axios from 'axios'
import authHeader from './auth-header';

const baseURL = 'http://192.168.1.148:3000'

const endpoints = {
    wallet: {
        get: `${baseURL}/api/wallet`
    }
}


class WalletService {
    async getWallets(){
        return await axios.get(endpoints.wallet.get, { headers: authHeader() })
    }
}

export default new WalletService()