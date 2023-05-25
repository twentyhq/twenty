import * as TypeGraphQL from "type-graphql";

export enum TransactionIsolationLevel {
  ReadUncommitted = "ReadUncommitted",
  ReadCommitted = "ReadCommitted",
  RepeatableRead = "RepeatableRead",
  Serializable = "Serializable"
}
TypeGraphQL.registerEnumType(TransactionIsolationLevel, {
  name: "TransactionIsolationLevel",
  description: undefined,
});
