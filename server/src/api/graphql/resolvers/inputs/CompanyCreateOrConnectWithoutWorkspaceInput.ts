import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { CompanyCreateWithoutWorkspaceInput } from "../inputs/CompanyCreateWithoutWorkspaceInput";
import { CompanyWhereUniqueInput } from "../inputs/CompanyWhereUniqueInput";

@TypeGraphQL.InputType("CompanyCreateOrConnectWithoutWorkspaceInput", {
  isAbstract: true
})
export class CompanyCreateOrConnectWithoutWorkspaceInput {
  @TypeGraphQL.Field(_type => CompanyWhereUniqueInput, {
    nullable: false
  })
  where!: CompanyWhereUniqueInput;

  @TypeGraphQL.Field(_type => CompanyCreateWithoutWorkspaceInput, {
    nullable: false
  })
  create!: CompanyCreateWithoutWorkspaceInput;
}
