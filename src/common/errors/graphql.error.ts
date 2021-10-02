import { ApolloError } from "apollo-server-errors";
import { GraphQLError } from "graphql";

import { logger } from "@common/winston";

export interface IErrorProperties {
    userId: string;
}

export const formatError = (err: GraphQLError): GraphQLError => {
    if (err.extensions?.exception.isRateLimitError) {
        (err.extensions as any).code = "TOO_MANY_REQUESTS";
        err.message = `Too many request, please try after a while`;
    }
    const { code, path, stacktrace } = {
        code: err.extensions?.code,
        path: err.path,
        stacktrace: err.extensions?.exception.stacktrace
    };

    const { userId }: IErrorProperties = {
        userId: err.extensions?.userId
    };

    logger.error(err.message, {
        code,
        context: "GraphQL",
        path,
        stacktrace,
        userId
    });

    return err;
};

export class SyntaxError extends ApolloError {
    constructor(message: string, properties?: { [key: string]: any }) {
        super(message, "GRAPHQL_PARSE_FAILED", properties);
        Object.defineProperty(this, "name", { value: "SyntaxError" });
    }
}

export class ValidationError extends ApolloError {
    constructor(message: string, properties?: { [key: string]: any }) {
        super(message, "GRAPHQL_VALIDATION_FAILED", properties);
        Object.defineProperty(this, "name", { value: "ValidationError" });
    }
}

export class AuthenticationError extends ApolloError {
    constructor(message: string, properties?: { [key: string]: any }) {
        super(message, "UNAUTHENTICATED", properties);
        Object.defineProperty(this, "name", { value: "AuthenticationError" });
    }
}

export class ForbiddenError extends ApolloError {
    constructor(message: string, properties?: { [key: string]: any }) {
        super(message, "FORBIDDEN", properties);
        Object.defineProperty(this, "name", { value: "ForbiddenError" });
    }
}

export class PersistedQueryNotFoundError extends ApolloError {
    constructor(properties?: { [key: string]: any }) {
        super(
            "PersistedQueryNotFound",
            "PERSISTED_QUERY_NOT_FOUND",
            properties
        );
        Object.defineProperty(this, "name", {
            value: "PersistedQueryNotFoundError"
        });
    }
}

export class PersistedQueryNotSupportedError extends ApolloError {
    constructor(properties?: { [key: string]: any }) {
        super(
            "PersistedQueryNotSupported",
            "PERSISTED_QUERY_NOT_SUPPORTED",
            properties
        );
        Object.defineProperty(this, "name", {
            value: "PersistedQueryNotSupportedError"
        });
    }
}

export class UserInputError extends ApolloError {
    constructor(message: string, properties?: Record<string, any>) {
        super(message, "BAD_USER_INPUT", properties);
        Object.defineProperty(this, "name", { value: "UserInputError" });
    }
}
