// https://www.apollographql.com/docs/apollo-server/schema/directives/
import { createRateLimitDirective } from "graphql-rate-limit";
import PermissionDirective from "./permission";
import UpperCaseDirective from "./upper";
import ValidateDirective from "./validate";
// import AuthDirective from "./auth";
// import PathDirective from "./path";
// import DeprecatedDirective from "./deprecated";
// import LengthDirective from './length'
// import DateFormatDirective from "./date";
// import ConcatDirective from "./concat";
// import RestDirective from "./rest";
// import IntlDirective from "./intl";

export default {
    rateLimit: createRateLimitDirective({
        identifyContext: ctx => (ctx.currentUser ? ctx.currentUser._id : "")
    }),
    hasPermission: PermissionDirective,
    upper: UpperCaseDirective,
    validate: ValidateDirective
    // isAuthenticated: AuthDirective,
    // hasPath: PathDirective,
    // deprecated: DeprecatedDirective,
    // length: LengthDirective,
    // date: DateFormatDirective,
    // concat: ConcatDirective,
    // intl: IntlDirective,
    // rest: RestDirective,
};
