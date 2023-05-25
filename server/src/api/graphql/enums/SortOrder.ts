import * as TypeGraphQL from "type-graphql";

export enum SortOrder {
  asc = "asc",
  desc = "desc"
}
TypeGraphQL.registerEnumType(SortOrder, {
  name: "SortOrder",
  description: undefined,
});
