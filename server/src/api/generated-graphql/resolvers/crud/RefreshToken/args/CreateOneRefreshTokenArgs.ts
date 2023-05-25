import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RefreshTokenCreateInput } from "../../../inputs/RefreshTokenCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOneRefreshTokenArgs {
  @TypeGraphQL.Field(_type => RefreshTokenCreateInput, {
    nullable: false
  })
  data!: RefreshTokenCreateInput;
}
