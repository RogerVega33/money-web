import axios from 'axios'
import authHeader from './auth-header';
import AuthService from '../services/auth.service';

class CategoryService {
    async getCategories(walletId){
        return await axios.get(`/api/category?walletId=${walletId}`, { headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw error;
        });
    }

    async saveCategory(category){
        return await axios.post(`/api/category`, category,{ headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw error;
        });
    }
}

export default new CategoryService()