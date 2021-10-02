import { GraphQLDefinitionsFactory } from "@nestjs/graphql";
import { join } from "path";

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
    typePaths: [join(process.cwd(), "src/**/*.gql")],
    path: join(process.cwd(), "src/common/graphql/generator/graphql.schema.ts"),
    outputAs: "class",
    debug: true
});
