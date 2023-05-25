import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RefreshTokenOrderByWithRelationInput } from "../../../inputs/RefreshTokenOrderByWithRelationInput";
import { RefreshTokenWhereInput } from "../../../inputs/RefreshTokenWhereInput";
import { RefreshTokenWhereUniqueInput } from "../../../inputs/RefreshTokenWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregateRefreshTokenArgs {
  @TypeGraphQL.Field(_type => RefreshTokenWhereInput, {
    nullable: true
  })
  where?: RefreshTokenWhereInput | undefined;

  @TypeGraphQL.Field(_type => [RefreshTokenOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: RefreshTokenOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => RefreshTokenWhereUniqueInput, {
    nullable: true
  })
  cursor?: RefreshTokenWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
