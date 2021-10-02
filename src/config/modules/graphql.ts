import { registerAs } from "@nestjs/config";

export default registerAs("gql", () => ({
    GqlDepthLimit: 10
}));
