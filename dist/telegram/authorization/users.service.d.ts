import { Model } from 'mongoose';
export interface IUser extends Document {
    telegramUsername: string;
    role?: string;
}
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<IUser>);
    addUser(data: {
        telegramUsername: string;
    }): Promise<IUser>;
    deleteUser(data: {
        telegramUsername: string;
    }): Promise<string>;
    isAdmin(telegramUsername: string): Promise<boolean>;
    getAllUsers(): Promise<{
        telegramUsername: string;
        username?: string;
        role?: string;
    }[]>;
}
