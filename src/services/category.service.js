import axios from 'axios'
import authHeader from './auth-header';
import AuthService from '../services/auth.service';
import store from '../store'

class CategoryService {
    async getCategories(walletId){
        return await axios.get(`${store.state.app.backend}/api/category?walletId=${walletId}`, { headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw error;
        });
    }

    async saveCategory(category){
        return await axios.post(`${store.state.app.backend}/api/category`, category,{ headers: authHeader() }).catch(function (e) {
            const error = e.toJSON();
            if(error.status === 403) AuthService.logout();
            else throw error;
        });
    }
}

export default new CategoryService()