import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PersonCreateWithoutWorkspaceInput } from "../inputs/PersonCreateWithoutWorkspaceInput";
import { PersonUpdateWithoutWorkspaceInput } from "../inputs/PersonUpdateWithoutWorkspaceInput";
import { PersonWhereUniqueInput } from "../inputs/PersonWhereUniqueInput";

@TypeGraphQL.InputType("PersonUpsertWithWhereUniqueWithoutWorkspaceInput", {
  isAbstract: true
})
export class PersonUpsertWithWhereUniqueWithoutWorkspaceInput {
  @TypeGraphQL.Field(_type => PersonWhereUniqueInput, {
    nullable: false
  })
  where!: PersonWhereUniqueInput;

  @TypeGraphQL.Field(_type => PersonUpdateWithoutWorkspaceInput, {
    nullable: false
  })
  update!: PersonUpdateWithoutWorkspaceInput;

  @TypeGraphQL.Field(_type => PersonCreateWithoutWorkspaceInput, {
    nullable: false
  })
  create!: PersonCreateWithoutWorkspaceInput;
}
