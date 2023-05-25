import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RefreshTokenUpdateManyMutationInput } from "../../../inputs/RefreshTokenUpdateManyMutationInput";
import { RefreshTokenWhereInput } from "../../../inputs/RefreshTokenWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyRefreshTokenArgs {
  @TypeGraphQL.Field(_type => RefreshTokenUpdateManyMutationInput, {
    nullable: false
  })
  data!: RefreshTokenUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => RefreshTokenWhereInput, {
    nullable: true
  })
  where?: RefreshTokenWhereInput | undefined;
}
