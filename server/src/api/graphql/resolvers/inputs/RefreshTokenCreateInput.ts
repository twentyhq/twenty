import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateNestedOneWithoutRefreshTokensInput } from "../inputs/UserCreateNestedOneWithoutRefreshTokensInput";

@TypeGraphQL.InputType("RefreshTokenCreateInput", {
  isAbstract: true
})
export class RefreshTokenCreateInput {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedAt?: Date | undefined;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  refreshToken!: string;

  @TypeGraphQL.Field(_type => UserCreateNestedOneWithoutRefreshTokensInput, {
    nullable: false
  })
  user!: UserCreateNestedOneWithoutRefreshTokensInput;
}
