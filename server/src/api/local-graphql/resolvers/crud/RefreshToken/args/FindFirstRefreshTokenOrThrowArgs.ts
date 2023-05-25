import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RefreshTokenOrderByWithRelationInput } from "../../../inputs/RefreshTokenOrderByWithRelationInput";
import { RefreshTokenWhereInput } from "../../../inputs/RefreshTokenWhereInput";
import { RefreshTokenWhereUniqueInput } from "../../../inputs/RefreshTokenWhereUniqueInput";
import { RefreshTokenScalarFieldEnum } from "../../../../enums/RefreshTokenScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindFirstRefreshTokenOrThrowArgs {
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

  @TypeGraphQL.Field(_type => [RefreshTokenScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"id" | "createdAt" | "updatedAt" | "deletedAt" | "refreshToken" | "userId"> | undefined;
}
