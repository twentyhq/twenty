import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PersonCreateWithoutCompanyInput } from "../inputs/PersonCreateWithoutCompanyInput";
import { PersonWhereUniqueInput } from "../inputs/PersonWhereUniqueInput";

@TypeGraphQL.InputType("PersonCreateOrConnectWithoutCompanyInput", {
  isAbstract: true
})
export class PersonCreateOrConnectWithoutCompanyInput {
  @TypeGraphQL.Field(_type => PersonWhereUniqueInput, {
    nullable: false
  })
  where!: PersonWhereUniqueInput;

  @TypeGraphQL.Field(_type => PersonCreateWithoutCompanyInput, {
    nullable: false
  })
  create!: PersonCreateWithoutCompanyInput;
}
