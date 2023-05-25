import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { CompanyUpdateWithoutWorkspaceInput } from "../inputs/CompanyUpdateWithoutWorkspaceInput";
import { CompanyWhereUniqueInput } from "../inputs/CompanyWhereUniqueInput";

@TypeGraphQL.InputType("CompanyUpdateWithWhereUniqueWithoutWorkspaceInput", {
  isAbstract: true
})
export class CompanyUpdateWithWhereUniqueWithoutWorkspaceInput {
  @TypeGraphQL.Field(_type => CompanyWhereUniqueInput, {
    nullable: false
  })
  where!: CompanyWhereUniqueInput;

  @TypeGraphQL.Field(_type => CompanyUpdateWithoutWorkspaceInput, {
    nullable: false
  })
  data!: CompanyUpdateWithoutWorkspaceInput;
}
