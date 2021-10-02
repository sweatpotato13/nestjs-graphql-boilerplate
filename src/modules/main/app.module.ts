import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "@common/interceptors/logging.interceptor";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GraphQLModule } from "@nestjs/graphql";
import { GqlConfigService } from "@src/common/graphql/graphql.config.service";
import { TypeOrmConfigService } from "@src/common/typeorm/typeorm.config.service";
import { Connection } from "typeorm";
import { AuthModule } from "@shared/modules/auth/auth.module";
// import { UsersModule } from "@modules/users/users.module";
import { BookModule } from "@modules/book/book.module";
import { UserHttpModule } from "../user/user-http.module";
import {
    GqlModuleConfig,
    TypeOrmModuleConfig,
    RedisModuleConfig,
} from "@config";

import { AppService } from "./app.service";
import { AppController } from "./app.controller";

@Module({
    imports: [
        GraphQLModule.forRootAsync({
            imports: [
                ConfigModule.forFeature(GqlModuleConfig),
                ConfigModule.forFeature(RedisModuleConfig),
                AuthModule,
            ],
            useClass: GqlConfigService,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule.forFeature(TypeOrmModuleConfig)],
            useClass: TypeOrmConfigService,
        }),
        /** ------------------ */
        UserHttpModule,
        BookModule,
        // UsersModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
})
export class AppModule {
    constructor(private connection: Connection) {}
}
