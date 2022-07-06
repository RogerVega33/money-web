import axios from 'axios'
import authHeader from './auth-header';
import AuthService from '../services/auth.service';

const baseURL = 'http://192.168.1.148:3000';

const endpoints = {
    category: {
        get: `${baseURL}/api/category`,
        save: `${baseURL}/api/category`,
    }
};

class CategoryService {
    async getCategories(walletId){
        return await axios.get(`${endpoints.category.get}?walletId=${walletId}`, { headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw error;
        });
    }

    async saveCategory(category){
        return await axios.post(endpoints.category.save, category,{ headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw error;
        });
    }
}

export default new CategoryService()