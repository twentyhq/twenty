import * as TypeGraphQL from "type-graphql";

export enum QueryMode {
  "default" = "default",
  insensitive = "insensitive"
}
TypeGraphQL.registerEnumType(QueryMode, {
  name: "QueryMode",
  description: undefined,
});
