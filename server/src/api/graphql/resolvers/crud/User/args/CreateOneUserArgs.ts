import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { UserCreateInput } from "../../../inputs/UserCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOneUserArgs {
  @TypeGraphQL.Field(_type => UserCreateInput, {
    nullable: false
  })
  data!: UserCreateInput;
}
