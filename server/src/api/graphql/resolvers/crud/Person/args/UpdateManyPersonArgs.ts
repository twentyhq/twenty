import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { PersonUpdateManyMutationInput } from "../../../inputs/PersonUpdateManyMutationInput";
import { PersonWhereInput } from "../../../inputs/PersonWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyPersonArgs {
  @TypeGraphQL.Field(_type => PersonUpdateManyMutationInput, {
    nullable: false
  })
  data!: PersonUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => PersonWhereInput, {
    nullable: true
  })
  where?: PersonWhereInput | undefined;
}
