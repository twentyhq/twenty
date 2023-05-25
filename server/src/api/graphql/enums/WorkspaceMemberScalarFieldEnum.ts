import * as TypeGraphQL from "type-graphql";

export enum WorkspaceMemberScalarFieldEnum {
  id = "id",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  deletedAt = "deletedAt",
  userId = "userId",
  workspaceId = "workspaceId"
}
TypeGraphQL.registerEnumType(WorkspaceMemberScalarFieldEnum, {
  name: "WorkspaceMemberScalarFieldEnum",
  description: undefined,
});
