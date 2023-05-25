import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { WorkspaceCreateWithoutWorkspaceMemberInput } from "../inputs/WorkspaceCreateWithoutWorkspaceMemberInput";
import { WorkspaceWhereUniqueInput } from "../inputs/WorkspaceWhereUniqueInput";

@TypeGraphQL.InputType("WorkspaceCreateOrConnectWithoutWorkspaceMemberInput", {
  isAbstract: true
})
export class WorkspaceCreateOrConnectWithoutWorkspaceMemberInput {
  @TypeGraphQL.Field(_type => WorkspaceWhereUniqueInput, {
    nullable: false
  })
  where!: WorkspaceWhereUniqueInput;

  @TypeGraphQL.Field(_type => WorkspaceCreateWithoutWorkspaceMemberInput, {
    nullable: false
  })
  create!: WorkspaceCreateWithoutWorkspaceMemberInput;
}
