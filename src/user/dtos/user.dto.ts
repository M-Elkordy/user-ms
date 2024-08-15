import { Expose } from "class-transformer";
import { IsEmail, IsMobilePhone, IsOptional, IsPhoneNumber, IsString, Length } from "class-validator";

export class UserDto {
    @Expose()
    email: string;

    @Expose()
    password: string;

    @Expose()
    passwordConfirmation: string;

    @Expose()
    userName: string;

    @Expose()
    fullName: string;

    @Expose()
    phoneNumber: string;

    @Expose()
    merchantId: string;

    @Expose()
    expireTokens?: string[];
}

export class SignInDto {
    @IsEmail({}, { message: 'Invalid Email' })
    email: string;

    @IsString({ message: 'Invalid String Password' })
    password: string;
}

export class CreateUserDto {
    @IsEmail({}, { message: 'Invalid Email' })
    email: string;

    @IsString({ message: 'Invalid String Password' })
    password: string;

    @IsString({ message: 'Invalid String Confirm-password' })
    passwordConfirmation: string;

    @IsString({ message: 'username must be a string' })
    @Length(
        4, 
        12, 
        { message: 'username must be within the length 4-12 character' }
    )
    userName: string;
    
    @IsString({ message: 'fullname must be a string' })
    fullName: string;

    @IsMobilePhone(
        'ar-EG', 
        { strictMode: false }, 
        { message: 'Invalid phone number' }
    )
    phoneNumber: string;

    @IsString()
    merchantId: string;
}

export class UpdateUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    password?: string;
} 