import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { CreateUserDto, SignInDto, UpdateUserDto, UserDto } from './dtos/user.dto';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';

@Controller('users')
export class UserController {
    constructor(private authService: AuthService, private usersService: UserService) {}

    @Post('/signin')
    @Serialize(UserDto)
    async signin(@Body() data: SignInDto) {
        const user = await this.authService.signIn(data);
        return user.access_token;
    }

    @Serialize(UserDto)
    @Post('/signup')
    async signUp(@Body() data: CreateUserDto) {
        return await this.authService.signUp(data);
    }
    
    @Post('/signout')
    @UseGuards(AuthGuard)
    async signOut(@Request() req: any) {
        const token = req.headers['authorization'].split(' ')[1];
        return await this.authService.signOut(token);
    }
    
    @Get('/:id')
    @UseGuards(AuthGuard)
    async findUser(@Param('id') id: string) {
        return await this.usersService.findUserById(id);
    }
    
    @Get('')
    @UseGuards(AuthGuard)
    async findAllUsers() {
        return await this.usersService.findAllUsers(); 
    }
    
    @Patch('/:id')
    @UseGuards(AuthGuard)
    @Serialize(UserDto)
    async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
        return await this.usersService.updateUser(id, body);
    }
    
    @Delete('/:id')
    @UseGuards(AuthGuard)
    @Serialize(UserDto)
    async deleteUser(@Param('id') id: string) {
        return await this.usersService.deleteUser(id);
    }
}
