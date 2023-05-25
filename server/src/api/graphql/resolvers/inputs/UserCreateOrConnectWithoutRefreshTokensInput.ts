import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateWithoutRefreshTokensInput } from "../inputs/UserCreateWithoutRefreshTokensInput";
import { UserWhereUniqueInput } from "../inputs/UserWhereUniqueInput";

@TypeGraphQL.InputType("UserCreateOrConnectWithoutRefreshTokensInput", {
  isAbstract: true
})
export class UserCreateOrConnectWithoutRefreshTokensInput {
  @TypeGraphQL.Field(_type => UserWhereUniqueInput, {
    nullable: false
  })
  where!: UserWhereUniqueInput;

  @TypeGraphQL.Field(_type => UserCreateWithoutRefreshTokensInput, {
    nullable: false
  })
  create!: UserCreateWithoutRefreshTokensInput;
}
