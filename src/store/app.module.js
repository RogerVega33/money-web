export const app = {
    namespaced: true,
    state: {
        backend: '',
        hideMoney: null
    },
    actions: {

    },
    mutations: {
        SET_BACKEND(state, value) {
            state.backend = value;
        },
        SET_HIDE_MONEY(state, value) {
            state.hideMoney = value;
            localStorage.setItem("hideMoney", value.toString());
        }
    },
};