import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateOrConnectWithoutWorkspaceMemberInput } from "../inputs/UserCreateOrConnectWithoutWorkspaceMemberInput";
import { UserCreateWithoutWorkspaceMemberInput } from "../inputs/UserCreateWithoutWorkspaceMemberInput";
import { UserUpdateWithoutWorkspaceMemberInput } from "../inputs/UserUpdateWithoutWorkspaceMemberInput";
import { UserUpsertWithoutWorkspaceMemberInput } from "../inputs/UserUpsertWithoutWorkspaceMemberInput";
import { UserWhereUniqueInput } from "../inputs/UserWhereUniqueInput";

@TypeGraphQL.InputType("UserUpdateOneRequiredWithoutWorkspaceMemberNestedInput", {
  isAbstract: true
})
export class UserUpdateOneRequiredWithoutWorkspaceMemberNestedInput {
  @TypeGraphQL.Field(_type => UserCreateWithoutWorkspaceMemberInput, {
    nullable: true
  })
  create?: UserCreateWithoutWorkspaceMemberInput | undefined;

  @TypeGraphQL.Field(_type => UserCreateOrConnectWithoutWorkspaceMemberInput, {
    nullable: true
  })
  connectOrCreate?: UserCreateOrConnectWithoutWorkspaceMemberInput | undefined;

  @TypeGraphQL.Field(_type => UserUpsertWithoutWorkspaceMemberInput, {
    nullable: true
  })
  upsert?: UserUpsertWithoutWorkspaceMemberInput | undefined;

  @TypeGraphQL.Field(_type => UserWhereUniqueInput, {
    nullable: true
  })
  connect?: UserWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => UserUpdateWithoutWorkspaceMemberInput, {
    nullable: true
  })
  update?: UserUpdateWithoutWorkspaceMemberInput | undefined;
}
