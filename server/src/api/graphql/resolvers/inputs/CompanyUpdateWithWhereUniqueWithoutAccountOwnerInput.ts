import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { CompanyUpdateWithoutAccountOwnerInput } from "../inputs/CompanyUpdateWithoutAccountOwnerInput";
import { CompanyWhereUniqueInput } from "../inputs/CompanyWhereUniqueInput";

@TypeGraphQL.InputType("CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput", {
  isAbstract: true
})
export class CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput {
  @TypeGraphQL.Field(_type => CompanyWhereUniqueInput, {
    nullable: false
  })
  where!: CompanyWhereUniqueInput;

  @TypeGraphQL.Field(_type => CompanyUpdateWithoutAccountOwnerInput, {
    nullable: false
  })
  data!: CompanyUpdateWithoutAccountOwnerInput;
}
