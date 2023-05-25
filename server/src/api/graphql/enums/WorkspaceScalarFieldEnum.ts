import * as TypeGraphQL from "type-graphql";

export enum WorkspaceScalarFieldEnum {
  id = "id",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deletedAt = "deletedAt",
  domainName = "domainName",
  displayName = "displayName"
}
TypeGraphQL.registerEnumType(WorkspaceScalarFieldEnum, {
  name: "WorkspaceScalarFieldEnum",
  description: undefined,
});
