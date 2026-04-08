import axios from 'axios'
import authHeader from './auth-header';

class CategoryService {
    async getCategories(walletId){
        return await axios.get(`/api/category?walletId=${walletId}`, { headers: authHeader() });
    }

    async saveCategory(category){
        return await axios.post(`/api/category`, category,{ headers: authHeader() });
    }
}

export default new CategoryService()