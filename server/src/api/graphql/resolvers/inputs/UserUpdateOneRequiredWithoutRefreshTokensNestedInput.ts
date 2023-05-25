import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateOrConnectWithoutRefreshTokensInput } from "../inputs/UserCreateOrConnectWithoutRefreshTokensInput";
import { UserCreateWithoutRefreshTokensInput } from "../inputs/UserCreateWithoutRefreshTokensInput";
import { UserUpdateWithoutRefreshTokensInput } from "../inputs/UserUpdateWithoutRefreshTokensInput";
import { UserUpsertWithoutRefreshTokensInput } from "../inputs/UserUpsertWithoutRefreshTokensInput";
import { UserWhereUniqueInput } from "../inputs/UserWhereUniqueInput";

@TypeGraphQL.InputType("UserUpdateOneRequiredWithoutRefreshTokensNestedInput", {
  isAbstract: true
})
export class UserUpdateOneRequiredWithoutRefreshTokensNestedInput {
  @TypeGraphQL.Field(_type => UserCreateWithoutRefreshTokensInput, {
    nullable: true
  })
  create?: UserCreateWithoutRefreshTokensInput | undefined;

  @TypeGraphQL.Field(_type => UserCreateOrConnectWithoutRefreshTokensInput, {
    nullable: true
  })
  connectOrCreate?: UserCreateOrConnectWithoutRefreshTokensInput | undefined;

  @TypeGraphQL.Field(_type => UserUpsertWithoutRefreshTokensInput, {
    nullable: true
  })
  upsert?: UserUpsertWithoutRefreshTokensInput | undefined;

  @TypeGraphQL.Field(_type => UserWhereUniqueInput, {
    nullable: true
  })
  connect?: UserWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => UserUpdateWithoutRefreshTokensInput, {
    nullable: true
  })
  update?: UserUpdateWithoutRefreshTokensInput | undefined;
}
