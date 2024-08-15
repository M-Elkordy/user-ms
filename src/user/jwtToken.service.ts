import { Injectable } from "@nestjs/common";
import { UserDocument } from "./schemas/user.schema";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtTokenService {
    constructor(private jwtService: JwtService) {}

    async createJwtToken(user: UserDocument) {
        const payload = { id: user.id, merchantId: user.merchantId }
        return {
            access_token: await this.jwtService.signAsync(payload)
        }
    }

    async extractJwtTokenData(token: string) {
        const tokenDecoded = await this.jwtService.decode(token);
        return tokenDecoded;
    }
}