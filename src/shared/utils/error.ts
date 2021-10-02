import {
    ApolloError,
    AuthenticationError,
    UserInputError,
    ValidationError
} from "apollo-server-express";

class RateLimitError extends ApolloError {
    constructor(message: string) {
        super(message, "TOO_MANY_REQUESTS");

        Object.defineProperty(this, "name", { value: "RateLimitError" });
    }
}

export { AuthenticationError, UserInputError, ValidationError, RateLimitError };
