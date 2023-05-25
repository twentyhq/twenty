import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { WorkspaceMemberCreateOrConnectWithoutUserInput } from "../inputs/WorkspaceMemberCreateOrConnectWithoutUserInput";
import { WorkspaceMemberCreateWithoutUserInput } from "../inputs/WorkspaceMemberCreateWithoutUserInput";
import { WorkspaceMemberWhereUniqueInput } from "../inputs/WorkspaceMemberWhereUniqueInput";

@TypeGraphQL.InputType("WorkspaceMemberCreateNestedOneWithoutUserInput", {
  isAbstract: true
})
export class WorkspaceMemberCreateNestedOneWithoutUserInput {
  @TypeGraphQL.Field(_type => WorkspaceMemberCreateWithoutUserInput, {
    nullable: true
  })
  create?: WorkspaceMemberCreateWithoutUserInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceMemberCreateOrConnectWithoutUserInput, {
    nullable: true
  })
  connectOrCreate?: WorkspaceMemberCreateOrConnectWithoutUserInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceMemberWhereUniqueInput, {
    nullable: true
  })
  connect?: WorkspaceMemberWhereUniqueInput | undefined;
}
