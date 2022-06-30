import axios from 'axios'
import authHeader from './auth-header';

const baseURL = 'http://192.168.1.148:3000'

const endpoints = {
    transaction: {
        get: `${baseURL}/api/transaction`
    }
}


class TransactionService {
    async getTransactions(walletId, year, month){
        return await axios.get(`${endpoints.transaction.get}?walletId=${walletId}&year=${year}${month?'&month='+month:''}`, { headers: authHeader() })
    }
}

export default new TransactionService()