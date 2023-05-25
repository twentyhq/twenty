import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RefreshTokenCreateManyInput } from "../../../inputs/RefreshTokenCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyRefreshTokenArgs {
  @TypeGraphQL.Field(_type => [RefreshTokenCreateManyInput], {
    nullable: false
  })
  data!: RefreshTokenCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
