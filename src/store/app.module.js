export const app = {
    namespaced: true,
    state: {
        backend: ''
    },
    actions: {

    },
    mutations: {
        SET_BACKEND(state, value) {
            state.backend = value;
        },
    },
};