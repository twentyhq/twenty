import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RefreshTokenCreateInput } from "../../../inputs/RefreshTokenCreateInput";
import { RefreshTokenUpdateInput } from "../../../inputs/RefreshTokenUpdateInput";
import { RefreshTokenWhereUniqueInput } from "../../../inputs/RefreshTokenWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpsertOneRefreshTokenArgs {
  @TypeGraphQL.Field(_type => RefreshTokenWhereUniqueInput, {
    nullable: false
  })
  where!: RefreshTokenWhereUniqueInput;

  @TypeGraphQL.Field(_type => RefreshTokenCreateInput, {
    nullable: false
  })
  create!: RefreshTokenCreateInput;

  @TypeGraphQL.Field(_type => RefreshTokenUpdateInput, {
    nullable: false
  })
  update!: RefreshTokenUpdateInput;
}
