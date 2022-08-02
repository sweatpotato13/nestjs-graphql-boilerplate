import { AuthenticationError,formatError } from "@common/errors/graphql.error";
import { logger } from "@src/config/winston";
import { config, GqlModuleConfig, RedisModuleConfig } from "@config";
import { Inject,Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { GqlModuleOptions,GqlOptionsFactory } from "@nestjs/graphql";
import { AuthService } from "@shared/modules/auth/auth.service";
import { RedisCache } from "apollo-server-cache-redis";
import depthLimit from "graphql-depth-limit";
import { PubSub } from "graphql-subscriptions";
import GraphQLJSON, { GraphQLJSONObject } from "graphql-type-json";
import { join } from "path";

import {
    GraphQLErrorHandlerPlugin,
    GraphQLQueryLoggingPlugin,
    GraphQLResponseCachePlugin
} from "./plugins";

const pubsub = new PubSub();

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
    constructor(
        @Inject(GqlModuleConfig.KEY)
        private config: ConfigType<typeof GqlModuleConfig>,
        @Inject(RedisModuleConfig.KEY)
        private redisConfig: ConfigType<typeof RedisModuleConfig>,
        @Inject(AuthService) private readonly auth: AuthService
    ) {}

    async createGqlOptions(): Promise<GqlModuleOptions> {
        /* initialize cache */
        const cache = new RedisCache(this.redisConfig);

        return {
            // typePaths: ["./**/*.gql"],
            autoSchemaFile: join(process.cwd(), "src/schema.gql"),
            // resolvers: {
            //     JSON: GraphQLJSON,
            //     JSONObject: GraphQLJSONObject
            // },
            bodyParserConfig: { limit: "50mb" },
            onHealthCheck: () => {
                return new Promise((resolve, reject) => {
                    // Replace the `true` in this conditional with more specific checks!
                    if (true) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            },
            validationRules: [
                depthLimit(
                    this.config.GqlDepthLimit,
                    { ignore: [/_trusted$/, "idontcare"] },
                    depths => {
                        if (depths[""] === this.config.GqlDepthLimit - 1) {
                            logger.warn(
                                `⚠️  You can only descend ${this.config.GqlDepthLimit} levels.`,
                                { context: "GraphQL" }
                            );
                        }
                    }
                )
            ],
            introspection: true,
            playground: !config.isProduction && {
                settings: {
                    "editor.cursorShape": "line", // possible values: 'line', 'block', 'underline'
                    "editor.fontFamily": `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
                    "editor.fontSize": 14,
                    "editor.reuseHeaders": true, // new tab reuses headers from last tab
                    "editor.theme": "dark", // possible values: 'dark', 'light'
                    "general.betaUpdates": true,
                    "queryPlan.hideQueryPlanResponse": false,
                    "request.credentials": "include", // possible values: 'omit', 'include', 'same-origin'
                    "tracing.hideTracingResponse": false
                }
                // tabs: [
                // 	{
                // 		endpoint: END_POINT,
                // 		query: '{ hello }'
                // 	}
                // ]
            },
            tracing: !config.isProduction,
            cacheControl: !config.isProduction && {
                defaultMaxAge: 5,
                stripFormattedExtensions: false,
                calculateHttpHeaders: false
            },
            plugins: [
                new GraphQLErrorHandlerPlugin(),
                new GraphQLQueryLoggingPlugin(),
                new GraphQLResponseCachePlugin()
            ],
            context: async ({ req, res, connection }) => {
                if (connection) {
                    const { currentUser } = connection.context;

                    return {
                        pubsub,
                        currentUser
                    };
                }

                let currentUser;

                // console.log(ACCESS_TOKEN, req.headers)

                const token = req.headers[config.accessToken] as string;

                // console.log('token', token)
                if (token) {
                    currentUser = await this.auth.decodeJwt(token);
                }

                // console.log(currentUser);

                return {
                    req,
                    res,
                    pubsub,
                    currentUser,
                    trackErrors(errors) {
                        // Track the errors
                        // console.log(errors)
                    }
                };
            },
            cache,
            formatError,
            formatResponse: response => {
                // console.log(response);
                return response;
            },
            subscriptions: {
                path: `${config.apiPath}`,
                keepAlive: 1000,
                onConnect: async (connectionParams, webSocket, context) => {
                    !config.isProduction &&
                        logger.debug(`🔗  Connected to websocket`, {
                            context: "GraphQL"
                        });

                    const token = connectionParams[config.accessToken];

                    if (token) {
                        const currentUser = await this.auth.decodeJwt(token);

                        // TODO: 유저가 존재하는지 검사
                        // await getMongoRepository(User).updateOne(
                        //     { _id: currentUser._id },
                        //     {
                        //         $set: { isOnline: true }
                        //     },
                        //     {
                        //         upsert: true
                        //     }
                        // );

                        return { currentUser };
                    }

                    throw new AuthenticationError(
                        "Authentication token is invalid, please try again."
                    );
                },
                onDisconnect: async (webSocket, context) => {
                    !config.isProduction &&
                        logger.error(`❌  Disconnected to websocket`, {
                            context: "GraphQL"
                        });

                    const { initPromise } = context;
                    const { currentUser } = await initPromise;

                    // TODO: 온라인인지 아닌지 유저 접속 상태관리
                    // await getMongoRepository(User).updateOne(
                    //     { _id: currentUser.userId },
                    //     {
                    //         $set: { isOnline: false }
                    //     },
                    //     {
                    //         upsert: true
                    //     }
                    // );
                }
            },
            persistedQueries: {
                cache
            },
            installSubscriptionHandlers: true,
            uploads: {
                maxFieldSize: 2, // 1mb
                maxFileSize: 20, // 20mb
                maxFiles: 5
            }
        };
    }
}
