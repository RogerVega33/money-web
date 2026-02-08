import axios from 'axios'
import authHeader from './auth-header';
import AuthService from '../services/auth.service';

class WalletService {
    async getWallets(){
        return await axios.get(`/api/wallet`, { headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw error;
        });
    }

    async saveWallet(wallet){
        return await axios.post(`/api/wallet`, wallet, { headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw error;
        });
    }
}

export default new WalletService()