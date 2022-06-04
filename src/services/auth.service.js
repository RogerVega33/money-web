import axios from 'axios'

const baseURL = 'http://192.168.1.148:3000'

const options = {
    headers: {
        accept: '*/*',
        'Content-Type': 'application/json;charset=utf-8'
    }
}

const endpoints = {
    auth: {
        login: `${baseURL}/api/auth/login`
    }
}


class AuthService {

    async login(user){
        const response = await axios.post(endpoints.auth.login, user, options)
        if (response.data.body?.token) {
            localStorage.setItem('user', JSON.stringify(response.data.body))
        }
        return response.data.body
    }

    logout() {
        localStorage.removeItem('user')
    }
}

export default new AuthService()