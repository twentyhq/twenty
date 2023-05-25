import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RefreshTokenOrderByWithAggregationInput } from "../../../inputs/RefreshTokenOrderByWithAggregationInput";
import { RefreshTokenScalarWhereWithAggregatesInput } from "../../../inputs/RefreshTokenScalarWhereWithAggregatesInput";
import { RefreshTokenWhereInput } from "../../../inputs/RefreshTokenWhereInput";
import { RefreshTokenScalarFieldEnum } from "../../../../enums/RefreshTokenScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByRefreshTokenArgs {
  @TypeGraphQL.Field(_type => RefreshTokenWhereInput, {
    nullable: true
  })
  where?: RefreshTokenWhereInput | undefined;

  @TypeGraphQL.Field(_type => [RefreshTokenOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: RefreshTokenOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [RefreshTokenScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "createdAt" | "updatedAt" | "deletedAt" | "refreshToken" | "userId">;

  @TypeGraphQL.Field(_type => RefreshTokenScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: RefreshTokenScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
