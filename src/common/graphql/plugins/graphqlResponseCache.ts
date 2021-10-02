import { Plugin } from "@nestjs/graphql";
import { ApolloServerPlugin } from "apollo-server-plugin-base";
import responseCachePlugin from "apollo-server-plugin-response-cache";

@Plugin()
export class GraphQLResponseCachePlugin implements ApolloServerPlugin {
    requestDidStart = responseCachePlugin().requestDidStart;
}
