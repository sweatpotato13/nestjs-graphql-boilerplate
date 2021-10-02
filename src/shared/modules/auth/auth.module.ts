import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisModule } from "@shared/modules/database/redis/redis.module";
import { JwtModuleConfig } from "@config";
import { AuthService } from "./auth.service";

@Module({
    imports: [ConfigModule.forFeature(JwtModuleConfig), RedisModule],
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthModule {}
