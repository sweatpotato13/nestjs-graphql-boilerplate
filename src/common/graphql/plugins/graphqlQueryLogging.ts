import { Plugin } from "@nestjs/graphql";
import { ApolloServerPlugin } from "apollo-server-plugin-base";
import { GraphQLRequestContext } from "apollo-server-types";
import { logger } from "@common/winston";
import { config } from "@config";

@Plugin()
export class GraphQLQueryLoggingPlugin implements ApolloServerPlugin {
    requestDidStart(requestContext: GraphQLRequestContext) {
        if (
            !config.isProduction &&
            (requestContext.request.query as string).substring(6, 24) !==
                `IntrospectionQuery`
        )
            logger.info("", {
                context: "GraphQL",
                userId: requestContext.context.userId,
                query: requestContext.request.query,
                variables: requestContext.request.variables
            });
    }
}
