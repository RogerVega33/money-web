export const app = {
    namespaced: true,
    state: {
        hideMoney: null
    },
    actions: {

    },
    mutations: {
        SET_HIDE_MONEY(state, value) {
            state.hideMoney = value;
            localStorage.setItem("hideMoney", value.toString());
        }
    },
};