import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { jwtConstants } from "src/user/constants/auth.constant";
import { JwtTokenService } from "src/user/jwtToken.service";
import { UserService } from "src/user/user.service";


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtTokenService: JwtTokenService, private usersService: UserService, private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if(!token) 
            throw new UnauthorizedException();
        const data = await this.jwtTokenService.extractJwtTokenData(token);
        const expireTokens = await this.usersService.getExpireTokens(data.id);
        if(expireTokens && expireTokens.includes(token))
            throw new UnauthorizedException();
        const payload = await this.jwtService.verifyAsync( token, { secret: jwtConstants.secret });
        request['user'] = payload;
        return true;
    }
    
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers['authorization']?.split(' ') ?? [];
        return type == 'Bearer' ? token : undefined;
    }
}