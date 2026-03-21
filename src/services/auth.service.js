import axios from 'axios'

const options = {
    headers: {
        accept: '*/*',
        'Content-Type': 'application/json;charset=utf-8'
    }
}

class AuthService {

    async login(user){
        const response = await axios.post(`/api/auth/login`, user, options)
        if (response.data.body?.token) {
            localStorage.setItem('user', JSON.stringify(response.data.body))
        }
        return response.data.body
    }

    async createUser(user){
        const response = await axios.post(`/api/auth/user`, user, options)
        return response.data.body
    }

    logout() {
        localStorage.removeItem('user')
    }
}

export default new AuthService()