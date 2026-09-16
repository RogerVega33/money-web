import { normalizeAmount } from '@/utils/dataValidation'
import axios from 'axios'
import authHeader from './auth-header';

class WalletService {
    async getWallets(refreshPrices = true){
        return await axios.get(`/api/wallet${refreshPrices ? '' : '?refreshPrices=false'}`, { headers: authHeader() });
    }

    async updateWallet(wallet){
        const payload = { ...wallet };
        if (Object.prototype.hasOwnProperty.call(payload, 'startingAmount')) {
            payload.startingAmount = normalizeAmount(payload.startingAmount);
        }
        return await axios.put(`/api/wallet`, payload, { headers: authHeader() });
    }

    async saveWallet(wallet){
        return await axios.post(`/api/wallet`, { ...wallet, startingAmount: normalizeAmount(wallet.startingAmount) }, { headers: authHeader() });
    }
}

export default new WalletService()
