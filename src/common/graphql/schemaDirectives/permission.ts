import { AuthenticationError,ForbiddenError } from "apollo-server-core";
import { defaultFieldResolver,GraphQLField } from "graphql";
import { SchemaDirectiveVisitor } from "graphql-tools";
import { getManager } from "typeorm";

class PermissionDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field: GraphQLField<any, any>) {
        const { resolve = defaultFieldResolver } = field;
        const { permission } = this.args;

        field.resolve = async function(...args) {
            const { currentUser } = args[2];

            if (!currentUser) {
                const err = new AuthenticationError(
                    "Authentication token is invalid, please try again."
                );
                err.extensions.userId = currentUser.userId;

                throw err;
            }

            // TODO: entity를 불러와서 entityManager를 통해 DB로 부터 userId에 해당하는 Roles를 불러와서 검사해야함
            // const entityManager = getManager();
            // const userRoles = await entityManager
            //     .find(UserRole, {
            //         select: ["role"],
            //         where: { currentUser.userId }
            //     })
            //     .catch(error => {
            //         throw new ForbiddenError(`Can not found user role.`);
            //     });

            // if (!userRoles.includes(permission)) {
            //     throw new ForbiddenError(
            //         `You are not authorized for this resource.`
            //     );
            // }

            return resolve.apply(this, args);
        };
    }
}

export default PermissionDirective;
