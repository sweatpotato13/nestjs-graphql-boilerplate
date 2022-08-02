/* eslint-disable @typescript-eslint/no-empty-function */
import { config as _config } from "dotenv";
_config({ path: __dirname + "/../../.env" });
(process as any).send = process.send || function() {};

import GqlModuleConfig from "./modules/graphql";
import JwtModuleConfig from "./modules/jwt";
import RedisModuleConfig from "./modules/redis";
import TypeOrmModuleConfig from "./modules/typeorm";

export {
    GqlModuleConfig,
    JwtModuleConfig,
    RedisModuleConfig,
    TypeOrmModuleConfig,
};

export const config = {
    // Base
    isProduction: process.env.NODE_ENV === "production",
    // General
    appName: process.env.APP_NAME || "nestjs-graphql-boilerplate",
    appTitle: process.env.APP_TITLE || "nestjs-graphql-boilerplate",
    appDescription: process.env.APP_DESCRIPTION || "TEST API Microservice",
    // API
    apiPrefix: process.env.API_PREFIX || "v1",
    apiVersion: process.env.API_VERSION || "1.0",
    apiPath: process.env.API_PATH || "/graphql",
    // Server
    host: process.env.HOST || "0.0.0.0",
    port: parseInt(process.env.PORT) || 9000,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 10000,
    accessToken: process.env.ACCESS_TOKEN || "x-app-access-token",
    swaggerPath: process.env.SWAGGER_PATH || "/api"
};
