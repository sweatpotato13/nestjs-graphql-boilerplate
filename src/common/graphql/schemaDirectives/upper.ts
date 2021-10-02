import { SchemaDirectiveVisitor } from "graphql-tools";
import { GraphQLField, defaultFieldResolver } from "graphql";

class UpperCaseDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field: GraphQLField<any, any>) {
        const { resolve = defaultFieldResolver } = field;
        field.resolve = async function(...args) {
            const result = await resolve.apply(this, args);
            if (typeof result === "string") {
                return result.toUpperCase();
            }
            return result;
        };
    }
}

export default UpperCaseDirective;
