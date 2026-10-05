import AuthService from '../services/auth.service.js';
import { readSession, sameSessionToken } from '../utils/session.js';
const user = readSession();
const initialState = user
    ? { status: { loggedIn: true }, user }
    : { status: { loggedIn: false }, user: null };
export const auth = {
    namespaced: true,
    state: initialState,
    actions: {
        login({ commit }, user) {
            return AuthService.login(user).then(
                user => {
                    commit('loginSuccess', user);
                    return Promise.resolve(user);
                },
                error => {
                    commit('loginFailure');
                    return Promise.reject(error);
                }
            );
        },
        async logout({ state, commit }) {
            const user = state.user;
            if (user) await AuthService.logout(user);
            const current = readSession();
            // Un logout tardío no debe borrar un login nuevo en otra pestaña.
            if (current && !sameSessionToken(current.token, user?.token)) return false;
            AuthService.clearSession();
            commit('logout');
            return true;
        },
        clearSession({ commit }) {
            AuthService.clearSession();
            commit('logout');
        },
    },
    mutations: {
        syncSession(state, user) {
            state.status.loggedIn = Boolean(user);
            state.user = user;
        },
        loginSuccess(state, user) {
            state.status.loggedIn = true;
            state.user = user;
        },
        loginFailure(state) {
            state.status.loggedIn = false;
            state.user = null;
        },
        logout(state) {
            state.status.loggedIn = false;
            state.user = null;
        },
    },
};
