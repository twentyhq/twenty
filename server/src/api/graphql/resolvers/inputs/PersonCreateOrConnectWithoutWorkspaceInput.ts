import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PersonCreateWithoutWorkspaceInput } from "../inputs/PersonCreateWithoutWorkspaceInput";
import { PersonWhereUniqueInput } from "../inputs/PersonWhereUniqueInput";

@TypeGraphQL.InputType("PersonCreateOrConnectWithoutWorkspaceInput", {
  isAbstract: true
})
export class PersonCreateOrConnectWithoutWorkspaceInput {
  @TypeGraphQL.Field(_type => PersonWhereUniqueInput, {
    nullable: false
  })
  where!: PersonWhereUniqueInput;

  @TypeGraphQL.Field(_type => PersonCreateWithoutWorkspaceInput, {
    nullable: false
  })
  create!: PersonCreateWithoutWorkspaceInput;
}
