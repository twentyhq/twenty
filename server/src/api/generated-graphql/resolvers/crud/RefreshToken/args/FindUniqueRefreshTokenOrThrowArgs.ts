import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RefreshTokenWhereUniqueInput } from "../../../inputs/RefreshTokenWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class FindUniqueRefreshTokenOrThrowArgs {
  @TypeGraphQL.Field(_type => RefreshTokenWhereUniqueInput, {
    nullable: false
  })
  where!: RefreshTokenWhereUniqueInput;
}
