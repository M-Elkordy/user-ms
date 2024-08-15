import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./schemas/user.schema";
import { CreateUserDto } from "./dtos/user.dto";

export interface DataSource {
    findById: ( id: string ) => Promise<UserDocument>;
    findByEmail: ( email: string ) => Promise<UserDocument>;
    createUser: ( createdUser: CreateUserDto ) => Promise<UserDocument>;
    updateUser: ( id: string, user: UserDocument ) => Promise<UserDocument>;
    deleteUser: (id: string) => Promise<string>;
    updateExpireTokenArray: (id: string, token: string) => Promise<UserDocument>;
    findAllUsers: () => Promise<UserDocument[]>;
    addPayerIdToUser: (payerId: string, userId: string) => Promise<UserDocument>;
    deleteUserByMerchantId: (merchantId: string) => Promise<UserDocument>;
}

export class UsersRepository implements DataSource {
    constructor(@InjectModel(User.name) private usersModel: Model<User>) {}

    async findByEmail(email: string): Promise<UserDocument> {
        let filter = {};
        if(email) 
            filter = { email: email };
        return await this.usersModel.findOne(filter);
    }

    async createUser(createdUser: CreateUserDto) : Promise<UserDocument> {
        try {
            return await this.usersModel.create(createdUser);
        } catch (error) {
            return error;
        }
    };

    async findById(id: string): Promise<UserDocument> {
        return await this.usersModel.findById(id);
    }

    async findAllUsers(): Promise<UserDocument[]> {
        return await this.usersModel.find();
    }

    async updateUser(id: string, user: UserDocument) {
        try {
            await this.usersModel.updateOne({ _id: user._id }, user);
            return await this.findById(id);
        } catch (error) {
            return error;
        }
    }

    async deleteUser(id: string) {
        try {
            await this.usersModel.deleteOne({ _id: id });
            return "User Deleted Successfully";
        } catch (error) {
            return error;
        }
    }

    async updateExpireTokenArray(id: string, token: string) {
        try {
            return this.usersModel.findByIdAndUpdate(
                id, 
                { $push: { expireTokens: token } },
                { new: true }
            ).exec();
        } catch (error) {
            return error;
        }
    }

    async addPayerIdToUser(payerId: string, userId: string) {
        const user = await this.usersModel.findByIdAndUpdate(
            userId,
            { $push: { payerId: payerId } },
            { new: true }
        );
        return user;
    }

    async deleteUserByMerchantId(merchantId: string) {
        return await this.usersModel.findOneAndDelete(
            { merchantId: merchantId },
        );
    }
}