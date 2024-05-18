
import { userModelo } from "./models/userModelo.js";

export default class UserManager {

    async getUserEmail(mail) {
        try {
            return await userModelo.findOne({ email: mail }).lean();
        } catch (error) {
            throw error;
        }
    };

    async registerUser(user) {
        try {
            return await userModelo.create({ ...user });
        } catch (error) {
            throw error;
        }
    };
}