import { readSession } from '../utils/session';

export default function authHeader() {
    const user = readSession();
    if (user && user.token) {
        return { Authorization: 'Bearer ' + user.token };
    } else {
        return {};
    }
}
