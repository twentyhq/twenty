import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RefreshTokenUpdateInput } from "../../../inputs/RefreshTokenUpdateInput";
import { RefreshTokenWhereUniqueInput } from "../../../inputs/RefreshTokenWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOneRefreshTokenArgs {
  @TypeGraphQL.Field(_type => RefreshTokenUpdateInput, {
    nullable: false
  })
  data!: RefreshTokenUpdateInput;

  @TypeGraphQL.Field(_type => RefreshTokenWhereUniqueInput, {
    nullable: false
  })
  where!: RefreshTokenWhereUniqueInput;
}
