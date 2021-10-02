import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import jwt, { Algorithm } from "jsonwebtoken";
import { ITokenClaim } from "./auth.interface";
import { RedisService } from "@shared/modules/database/redis/redis.service";
import { JwtModuleConfig } from "@config";
import { genRandomBytesWithBase58 } from "@shared/utils";

@Injectable()
export class AuthService {
    public userJwtIndex = "activeJwtUsers";

    constructor(
        @Inject(JwtModuleConfig.KEY)
        private readonly config: ConfigType<typeof JwtModuleConfig>,
        @Inject("RedisService") private readonly redis: RedisService
    ) {}

    public signJwt(claims: ITokenClaim): string {
        return jwt.sign(claims, this.config.privateKey, {
            algorithm: this.config.algorithm as Algorithm,
            expiresIn: this.config.accessExpiresIn
        });
    }

    public async decodeJwt(token: string): Promise<ITokenClaim> {
        return new Promise(resolve => {
            jwt.verify(
                token,
                this.config.publicKey,
                {
                    algorithms: [this.config.algorithm as Algorithm]
                },
                (err, decoded) => {
                    if (err) return resolve(null);
                    return resolve(decoded as ITokenClaim);
                }
            );
        });
    }

    public createRefreshToken(): string {
        return genRandomBytesWithBase58(32);
    }

    private constructUserKey(userId: string, refreshToken: string): string {
        return `${this.userJwtIndex}:${userId}:${refreshToken}`;
    }

    public async registerToken(
        userId: string,
        refreshToken: string,
        token: string
    ): Promise<any> {
        return await this.redis.set(
            this.constructUserKey(userId, refreshToken),
            token,
            "EX",
            this.config.refreshExpiresIn
        );
    }

    public async getTokens(userId: string): Promise<string[]> {
        const keyValues = await this.redis.getAllKeyValues(
            `*${this.userJwtIndex}.${userId}`
        );
        return keyValues.map(keyValue => keyValue.value);
    }

    public async deAuthenticateUser(userId: string): Promise<void> {
        await this.clearAllSessions(userId);
    }

    public async refreshTokenExists(refreshToken: string): Promise<boolean> {
        return await this.redis.existsKey(`*${refreshToken}*`);
    }

    public async getUserAccountFromRefreshToken(
        refreshToken: string
    ): Promise<string> {
        const keys = await this.redis.keys(`*${refreshToken}*`);
        const exists = !!keys.length;

        if (!exists)
            throw new Error("User account not found for refresh token.");

        const key = keys[0];

        return key.substring(
            key.indexOf(this.userJwtIndex) + this.userJwtIndex.length + 1
        );
    }

    public async clearAllTokens(): Promise<any> {
        const allKeys = await this.redis.keys(`*${this.userJwtIndex}*`);
        return Promise.all(allKeys.map(async key => await this.redis.del(key)));
    }

    public async countTokens(): Promise<number> {
        return (await this.redis.keys(`*${this.userJwtIndex}*`)).length;
    }

    public async getToken(
        userId: string,
        refreshToken: string
    ): Promise<string | null> {
        return await this.redis.get(
            this.constructUserKey(userId, refreshToken)
        );
    }

    public async clearToken(
        userId: string,
        refreshToken: string
    ): Promise<any> {
        return await this.redis.del(
            this.constructUserKey(userId, refreshToken)
        );
    }

    public async countSessions(userId: string): Promise<number> {
        return (await this.redis.keys(`*${this.userJwtIndex}.${userId}`))
            .length;
    }

    public async clearAllSessions(userId: string): Promise<any> {
        const keyValues = await this.redis.getAllKeyValues(
            `*${this.userJwtIndex}.${userId}`
        );
        const keys = keyValues.map(keyValue => keyValue.key);
        return await Promise.all(
            keys.map(async key => await this.redis.del(key))
        );
    }

    public async sessionExists(
        userId: string,
        refreshToken: string
    ): Promise<boolean> {
        const token = await this.getToken(userId, refreshToken);
        return !!token;
    }
}
