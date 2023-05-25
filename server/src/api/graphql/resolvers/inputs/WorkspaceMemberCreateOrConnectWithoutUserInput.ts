import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { WorkspaceMemberCreateWithoutUserInput } from "../inputs/WorkspaceMemberCreateWithoutUserInput";
import { WorkspaceMemberWhereUniqueInput } from "../inputs/WorkspaceMemberWhereUniqueInput";

@TypeGraphQL.InputType("WorkspaceMemberCreateOrConnectWithoutUserInput", {
  isAbstract: true
})
export class WorkspaceMemberCreateOrConnectWithoutUserInput {
  @TypeGraphQL.Field(_type => WorkspaceMemberWhereUniqueInput, {
    nullable: false
  })
  where!: WorkspaceMemberWhereUniqueInput;

  @TypeGraphQL.Field(_type => WorkspaceMemberCreateWithoutUserInput, {
    nullable: false
  })
  create!: WorkspaceMemberCreateWithoutUserInput;
}
