import axios from 'axios'
import authHeader from './auth-header';
import AuthService from "./auth.service";

class TransactionService {
    async getTransactions(walletId, year, month){
        return await axios.get(`/api/transaction?walletId=${walletId}${year?'&year='+year:''}${month?'&month='+month:''}`,
            { headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw e;
        });
    }

    async getCryptoWalletTransactions(walletId){
        return await axios.get(`/api/transaction/crypto?walletId=${walletId}`,
            { headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw e;
        });
    }

    async getProfitLoss(walletId){
        return await axios.get(`/api/transaction/profitLoss?walletId=${walletId}`,
            { headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw e;
        });
    }

    async saveTransaction(transaction){
        return await axios.post(`/api/transaction`, transaction,{ headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw e;
        });
    }

    async saveCryptoTransaction(transaction){
        return await axios.post(`/api/transaction/crypto`, transaction,{ headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw e;
        });
    }

    async updateCryptoTransaction(transaction){
        return await axios.put(`/api/transaction/crypto`, transaction,{ headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw e;
        });
    }

    async deleteCryptoTransaction(transactionId){
        return await axios.delete(`/api/transaction/crypto?transactionId=${transactionId}`,
            { headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw e;
        });
    }
}

export default new TransactionService()