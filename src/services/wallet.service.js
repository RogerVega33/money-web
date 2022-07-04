import axios from 'axios'
import authHeader from './auth-header';
import AuthService from '../services/auth.service';

const baseURL = 'http://192.168.1.148:3000';

const endpoints = {
    wallet: {
        get: `${baseURL}/api/wallet`
    }
};


class WalletService {
    async getWallets(){
        return await axios.get(endpoints.wallet.get, { headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw error;
        });
    }
}

export default new WalletService()