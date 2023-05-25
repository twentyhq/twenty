import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { WorkspaceMemberCreateWithoutWorkspaceInput } from "../inputs/WorkspaceMemberCreateWithoutWorkspaceInput";
import { WorkspaceMemberUpdateWithoutWorkspaceInput } from "../inputs/WorkspaceMemberUpdateWithoutWorkspaceInput";
import { WorkspaceMemberWhereUniqueInput } from "../inputs/WorkspaceMemberWhereUniqueInput";

@TypeGraphQL.InputType("WorkspaceMemberUpsertWithWhereUniqueWithoutWorkspaceInput", {
  isAbstract: true
})
export class WorkspaceMemberUpsertWithWhereUniqueWithoutWorkspaceInput {
  @TypeGraphQL.Field(_type => WorkspaceMemberWhereUniqueInput, {
    nullable: false
  })
  where!: WorkspaceMemberWhereUniqueInput;

  @TypeGraphQL.Field(_type => WorkspaceMemberUpdateWithoutWorkspaceInput, {
    nullable: false
  })
  update!: WorkspaceMemberUpdateWithoutWorkspaceInput;

  @TypeGraphQL.Field(_type => WorkspaceMemberCreateWithoutWorkspaceInput, {
    nullable: false
  })
  create!: WorkspaceMemberCreateWithoutWorkspaceInput;
}
