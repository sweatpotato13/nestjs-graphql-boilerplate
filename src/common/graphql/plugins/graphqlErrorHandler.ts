import { Plugin } from "@nestjs/graphql";
import { ApolloServerPlugin } from "apollo-server-plugin-base";
// import {
//     AuthenticationError,
//     UserInputError,
//     ValidationError,
//     RateLimitError
// } from "@shared/utils";

// const knownErrors = [
//     AuthenticationError,
//     UserInputError,
//     ValidationError,
//     RateLimitError
// ];

@Plugin()
export class GraphQLErrorHandlerPlugin implements ApolloServerPlugin {
    requestDidStart() {
        return {
            didEncounterErrors(requestContext) {
                for (const error of requestContext.errors) {
                    const err = error.originalError || error;
                }

                return;
            }
        };
    }
}
