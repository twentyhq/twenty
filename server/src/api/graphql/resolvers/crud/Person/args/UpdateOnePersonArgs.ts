import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PersonUpdateInput } from "../../../inputs/PersonUpdateInput";
import { PersonWhereUniqueInput } from "../../../inputs/PersonWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOnePersonArgs {
  @TypeGraphQL.Field(_type => PersonUpdateInput, {
    nullable: false
  })
  data!: PersonUpdateInput;

  @TypeGraphQL.Field(_type => PersonWhereUniqueInput, {
    nullable: false
  })
  where!: PersonWhereUniqueInput;
}
