import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { WorkspaceMemberCreateWithoutWorkspaceInput } from "../inputs/WorkspaceMemberCreateWithoutWorkspaceInput";
import { WorkspaceMemberWhereUniqueInput } from "../inputs/WorkspaceMemberWhereUniqueInput";

@TypeGraphQL.InputType("WorkspaceMemberCreateOrConnectWithoutWorkspaceInput", {
  isAbstract: true
})
export class WorkspaceMemberCreateOrConnectWithoutWorkspaceInput {
  @TypeGraphQL.Field(_type => WorkspaceMemberWhereUniqueInput, {
    nullable: false
  })
  where!: WorkspaceMemberWhereUniqueInput;

  @TypeGraphQL.Field(_type => WorkspaceMemberCreateWithoutWorkspaceInput, {
    nullable: false
  })
  create!: WorkspaceMemberCreateWithoutWorkspaceInput;
}
