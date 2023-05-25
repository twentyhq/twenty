import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { CompanyWhereInput } from "../inputs/CompanyWhereInput";

@TypeGraphQL.InputType("CompanyListRelationFilter", {
  isAbstract: true
})
export class CompanyListRelationFilter {
  @TypeGraphQL.Field(_type => CompanyWhereInput, {
    nullable: true
  })
  every?: CompanyWhereInput | undefined;

  @TypeGraphQL.Field(_type => CompanyWhereInput, {
    nullable: true
  })
  some?: CompanyWhereInput | undefined;

  @TypeGraphQL.Field(_type => CompanyWhereInput, {
    nullable: true
  })
  none?: CompanyWhereInput | undefined;
}
