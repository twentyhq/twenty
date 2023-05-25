import * as TypeGraphQL from "type-graphql";

export enum NullableJsonNullValueInput {
  DbNull = "DbNull",
  JsonNull = "JsonNull"
}
TypeGraphQL.registerEnumType(NullableJsonNullValueInput, {
  name: "NullableJsonNullValueInput",
  description: undefined,
});
