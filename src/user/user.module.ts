import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersRepository } from './user.repository';
import { AuthService } from './auth.service';
import { JwtTokenService } from './jwtToken.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/auth.constant';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CurrentUserInterceptor } from 'src/interceptors/current-user.interceptor';
import { RabbitMQModule } from 'src/rabbitMQ/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '6000s' }
    }),
    RabbitMQModule
  ],
  controllers: [UserController],
  providers: [
    UserService,
    AuthService,
    JwtTokenService,
    {
      provide: 'DataSource',
      useClass: UsersRepository
    }, 
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor
    }
  ]
})
export class UserModule {}
