import axios from 'axios'
import authHeader from './auth-header';
import AuthService from "./auth.service";
import store from '../store'

class TransactionService {
    async getTransactions(walletId, year, month){
        return await axios.get(`${store.state.app.backend}/api/transaction?walletId=${walletId}${year?'&year='+year:''}${month?'&month='+month:''}`,
            { headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw e;
        });
    }

    async getCryptoWalletTransactions(walletId){
        return await axios.get(`${store.state.app.backend}/api/transaction/crypto?walletId=${walletId}`,
            { headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw e;
        });
    }

    async getProfitLoss(walletId){
        return await axios.get(`${store.state.app.backend}/api/transaction/profitLoss?walletId=${walletId}`,
            { headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw e;
        });
    }

    async saveTransaction(transaction){
        return await axios.post(`${store.state.app.backend}/api/transaction`, transaction,{ headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw e;
        });
    }
}

export default new TransactionService()