import { normalizeAmount } from '@/utils/dataValidation'
import axios from 'axios'
import authHeader from './auth-header';

class WalletService {
    async getWallets(){
        return await axios.get(`/api/wallet`, { headers: authHeader() });
    }

    async saveWallet(wallet){
        return await axios.post(`/api/wallet`, { ...wallet, startingAmount: normalizeAmount(wallet.startingAmount) }, { headers: authHeader() });
    }
}

export default new WalletService()