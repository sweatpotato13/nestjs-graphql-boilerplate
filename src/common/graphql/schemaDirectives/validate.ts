import * as GraphQLSchema from "@common/graphql/generator/graphql.schema";
import { logger } from "@src/config/winston";
import { UserInputError } from "apollo-server-core";
import { validate } from "class-validator";
import {
    defaultFieldResolver,
    GraphQLArgument,
    GraphQLField,
    GraphQLObjectType
} from "graphql";
import { SchemaDirectiveVisitor } from "graphql-tools";

class ValidateDirective extends SchemaDirectiveVisitor {
    visitArgumentDefinition(
        arg: GraphQLArgument,
        details: {
            field: GraphQLField<any, any>;
            objectType: GraphQLObjectType;
        }
    ) {
        const { field } = details;
        const { resolve = defaultFieldResolver } = field;

        const { schema } = this.args;

        field.resolve = async function(...args) {
            const { input } = args[1]; // const input = args[1]여야 하지 않을까?
            const { currentUser } = args[2];

            logger.info(`🧪  Schema: ${schema}`, { context: "Validator" });

            const prototype = arg.type.toString().replace("!", "");

            const object = new GraphQLSchema[prototype as string]();

            Object.assign(object, input);

            const errors = await validate(schema, object);

            if (errors.length > 0) {
                const err = new UserInputError(
                    `Form Arguments invalid: ${errors
                        .map(err => {
                            for (const property in err.constraints) {
                                return err.constraints[property as string];
                            }
                        })
                        .join(", ")}`
                );
                err.extensions.userId = currentUser.userId;
                throw err;
            }
            return await resolve.apply(this, args);
        };
    }
}

export default ValidateDirective;
