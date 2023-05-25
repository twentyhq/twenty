import * as TypeGraphQL from "type-graphql";

export enum JsonNullValueFilter {
  DbNull = "DbNull",
  JsonNull = "JsonNull",
  AnyNull = "AnyNull"
}
TypeGraphQL.registerEnumType(JsonNullValueFilter, {
  name: "JsonNullValueFilter",
  description: undefined,
});
