import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDto, SignInDto } from "./dtos/user.dto";
import { UserService } from "./user.service";
import { JwtTokenService } from "./jwtToken.service";

const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
    constructor(private usersService: UserService, private jwtService: JwtTokenService) {}

    async signIn(data: SignInDto) {
        const { email, password } = data;
        const user = await this.usersService.findUserByEmail(email);
        if(!user) 
            throw new BadRequestException('User not found!');

        const result = await bcrypt.compare(password, user.password);
        if(!result)
            throw new BadRequestException("Incorrect password!");

        return await this.jwtService.createJwtToken(user);
    }

    async signUp(createdUser: CreateUserDto) {
        const { email } = createdUser;
        const user = await this.usersService.findUserByEmail(email);
        if(user)
            throw new BadRequestException('Email was found');
        if (createdUser.password !== createdUser.passwordConfirmation) 
            throw new BadRequestException("Password confirmation does not match password");
        const saltRounds = 10;
        const hash = await bcrypt.hash(createdUser.password, saltRounds);
        createdUser.password = hash;
        return await this.usersService.createUser(createdUser);
    }

    async signOut(token: string) {
        const user = await this.jwtService.extractJwtTokenData(token);
        const userId = user.id;
        return this.usersService.addExpireToken(userId, token);
    }
}