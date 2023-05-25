import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { CompanyWhereUniqueInput } from "../../../inputs/CompanyWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteOneCompanyArgs {
  @TypeGraphQL.Field(_type => CompanyWhereUniqueInput, {
    nullable: false
  })
  where!: CompanyWhereUniqueInput;
}
