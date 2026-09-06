import { normalizeAmount } from '@/utils/dataValidation'
import axios from 'axios'
import authHeader from './auth-header';

class TransactionService {
    async getTransactions(walletId, year, month){
        return await axios.get(`/api/transaction?walletId=${walletId}${year?'&year='+year:''}${month?'&month='+month:''}`,
            { headers: authHeader() });
    }

    async getCryptoWalletTransactions(walletId){
        return await axios.get(`/api/transaction/crypto?walletId=${walletId}`,
            { headers: authHeader() });
    }

    async getProfitLoss(walletId){
        return await axios.get(`/api/transaction/profitLoss?walletId=${walletId}`,
            { headers: authHeader() });
    }

    async saveTransaction(transaction){
        return await axios.post(`/api/transaction`, { ...transaction, amount: normalizeAmount(transaction.amount) },{ headers: authHeader() });
    }

    async saveCryptoTransaction(transaction){
        return await axios.post(`/api/transaction/crypto`, { ...transaction, amount: normalizeAmount(transaction.amount) },{ headers: authHeader() });
    }

    async updateCryptoTransaction(transaction){
        return await axios.put(`/api/transaction/crypto`, { ...transaction, amount: normalizeAmount(transaction.amount) },{ headers: authHeader() });
    }

    async updateTransaction(transaction){
        return await axios.put(`/api/transaction`, { ...transaction, amount: normalizeAmount(transaction.amount) },{ headers: authHeader() });
    }

    async deleteCryptoTransaction(transactionId){
        return await axios.delete(`/api/transaction/crypto?transactionId=${transactionId}`,
            { headers: authHeader() });
    }

    async deleteTransaction(transactionId){
        return await axios.delete(`/api/transaction?transactionId=${transactionId}`,
            { headers: authHeader() });
    }
}

export default new TransactionService()