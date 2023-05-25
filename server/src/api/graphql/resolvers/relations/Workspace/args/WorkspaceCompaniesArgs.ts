import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { CompanyOrderByWithRelationInput } from "../../../inputs/CompanyOrderByWithRelationInput";
import { CompanyWhereInput } from "../../../inputs/CompanyWhereInput";
import { CompanyWhereUniqueInput } from "../../../inputs/CompanyWhereUniqueInput";
import { CompanyScalarFieldEnum } from "../../../../enums/CompanyScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class WorkspaceCompaniesArgs {
  @TypeGraphQL.Field(_type => CompanyWhereInput, {
    nullable: true
  })
  where?: CompanyWhereInput | undefined;

  @TypeGraphQL.Field(_type => [CompanyOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: CompanyOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => CompanyWhereUniqueInput, {
    nullable: true
  })
  cursor?: CompanyWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [CompanyScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"id" | "createdAt" | "updatedAt" | "deletedAt" | "name" | "domainName" | "address" | "employees" | "accountOwnerId" | "workspaceId"> | undefined;
}
