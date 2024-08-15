import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { DataSource } from './user.repository';
import { CreateUserDto, UpdateUserDto } from './dtos/user.dto';
import { RabbitMQService } from 'src/rabbitMQ/rabbitmq.service';

@Injectable()
export class UserService implements OnModuleInit {
    constructor(
        @Inject('DataSource') private usersRepository: DataSource,
        private readonly rabbitmqService: RabbitMQService
    ) {}

    async onModuleInit() {
        await this.rabbitmqService.consume('users-queue', (msg) => {
            const message = JSON.parse(msg.content.toString());
            const headers = msg.properties.headers;
            const functionName = headers.functionName;
            const args = message.args || [];

            if (typeof this[functionName] === 'function') {
                this[functionName].apply(this, args);
            } else {
                throw new BadRequestException(`Function ${functionName} is not defined in UsersService.`);
            }
        });
    }
    
    async findUserById(id: string) {
        if(!id) return null;
        const user = await this.usersRepository.findById(id);
        if(!user) 
            throw new NotFoundException("User not found!");
        
        return user;
    }
    
    async findUserByEmail(email: string) {
        return await this.usersRepository.findByEmail(email);
    }
    
    async findAllUsers() {
        return await this.usersRepository.findAllUsers();
    }
    
    async createUser(user: CreateUserDto) {
        const createdUser = await this.usersRepository.createUser(user);
        const merchantMessage = {
            args: [user.merchantId, createdUser._id]
        }
        const headers = { functionName: 'addUserIdToMerchant' };

        this.rabbitmqService.publish('merchants-queue', JSON.stringify(merchantMessage), headers);
        return createdUser;
    }

    async updateUser(id: string, data: UpdateUserDto) {
        const user = await this.findUserById(id);
        if(!user) 
            throw new NotFoundException("User not found!");
        Object.assign(user, data);
        return await this.usersRepository.updateUser(id, user);
    }

    async deleteUser(id: string, isQueued: boolean = false) {
        const user = await this.findUserById(id);
        if(!user)
            throw new NotFoundException("User not Found!"); 
        const result = await this.usersRepository.deleteUser(id);
        if(isQueued) {
            const merchantMessage = {
                args: [user.merchantId, id]
            }
            const payerMessage = {
                args: [user.merchantId, id]
            }
            const headers = { functionName: 'updateUserId' };
    
            this.rabbitmqService.publish('merchants-queue', JSON.stringify(merchantMessage), headers);
            this.rabbitmqService.publish('payers-queue', JSON.stringify(payerMessage), headers);
        }
        return result;
    }

    async deleteUserByMerchantId(merchantId: string) {
        return await this.usersRepository.deleteUserByMerchantId(merchantId);
    }

    async addExpireToken(id: string, token: string) {
        const user = await this.findUserById(id);
        if(!user) 
            throw new NotFoundException('User Not Found!');

        const merchantMessage = {
            args: [user.merchantId, token, user._id.toString()]
        };
        const payerMessage = {
            args: [user.payerId, token, user._id.toString()]
        };
        const headers = { functionName: 'updateInvalidTokensArray' };

        await this.usersRepository.updateExpireTokenArray(id, token); 
        this.rabbitmqService.publish('merchants-queue', JSON.stringify(merchantMessage), headers);
        this.rabbitmqService.publish('payers-queue', JSON.stringify(payerMessage), headers);
    }

    async getExpireTokens(id: string) {
        const user = await this.findUserById(id);
        return user.expireTokens;
    }

    async addPayerIdToUser(payerId: string, userId: string) {
        return await this.usersRepository.addPayerIdToUser(payerId, userId);
    }
}
