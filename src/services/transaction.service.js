import axios from 'axios'
import authHeader from './auth-header';
import AuthService from "./auth.service";

const baseURL = 'http://192.168.1.148:3000';

const endpoints = {
    transaction: {
        get: `${baseURL}/api/transaction`
    }
};


class TransactionService {
    async getTransactions(walletId, year, month){
        return await axios.get(`${endpoints.transaction.get}?walletId=${walletId}${year?'&year='+year:''}${month?'&month='+month:''}`,
            { headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw error;
        });
    }
}

export default new TransactionService()