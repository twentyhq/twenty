import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PersonWhereInput } from "../../../inputs/PersonWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyPersonArgs {
  @TypeGraphQL.Field(_type => PersonWhereInput, {
    nullable: true
  })
  where?: PersonWhereInput | undefined;
}
