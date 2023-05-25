import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateWithoutRefreshTokensInput } from "../inputs/UserCreateWithoutRefreshTokensInput";
import { UserUpdateWithoutRefreshTokensInput } from "../inputs/UserUpdateWithoutRefreshTokensInput";

@TypeGraphQL.InputType("UserUpsertWithoutRefreshTokensInput", {
  isAbstract: true
})
export class UserUpsertWithoutRefreshTokensInput {
  @TypeGraphQL.Field(_type => UserUpdateWithoutRefreshTokensInput, {
    nullable: false
  })
  update!: UserUpdateWithoutRefreshTokensInput;

  @TypeGraphQL.Field(_type => UserCreateWithoutRefreshTokensInput, {
    nullable: false
  })
  create!: UserCreateWithoutRefreshTokensInput;
}
