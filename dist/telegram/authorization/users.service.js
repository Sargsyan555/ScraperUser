"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const schema_1 = require("./schema/schema");
let UsersService = class UsersService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async addUser(data) {
        const exists = await this.userModel
            .findOne({ telegramUsername: data.telegramUsername })
            .exec();
        if (exists)
            return exists;
        const createdUser = new this.userModel(data);
        return createdUser.save();
    }
    async deleteUser(data) {
        const user = await this.userModel
            .findOne({ telegramUsername: data.telegramUsername })
            .exec();
        if (!user) {
            return 'Пользователь не найден';
        }
        await this.userModel.deleteOne({ telegramUsername: data.telegramUsername });
        return 'Пользователь удален';
    }
    async isAdmin(telegramUsername) {
        const user = await this.userModel.findOne({ telegramUsername });
        return user?.role === 'admin' || user?.role === 'torossyann1';
    }
    async getAllUsers() {
        return this.userModel
            .find({}, { telegramUsername: 1, username: 1, role: 1, _id: 0 })
            .lean();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map