import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { CompanyOrderByRelationAggregateInput } from "../inputs/CompanyOrderByRelationAggregateInput";
import { PersonOrderByRelationAggregateInput } from "../inputs/PersonOrderByRelationAggregateInput";
import { WorkspaceMemberOrderByRelationAggregateInput } from "../inputs/WorkspaceMemberOrderByRelationAggregateInput";
import { SortOrder } from "../../enums/SortOrder";

@TypeGraphQL.InputType("WorkspaceOrderByWithRelationInput", {
  isAbstract: true
})
export class WorkspaceOrderByWithRelationInput {
  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  id?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  createdAt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  updatedAt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  deletedAt?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  domainName?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => SortOrder, {
    nullable: true
  })
  displayName?: "asc" | "desc" | undefined;

  @TypeGraphQL.Field(_type => WorkspaceMemberOrderByRelationAggregateInput, {
    nullable: true
  })
  WorkspaceMember?: WorkspaceMemberOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field(_type => CompanyOrderByRelationAggregateInput, {
    nullable: true
  })
  companies?: CompanyOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field(_type => PersonOrderByRelationAggregateInput, {
    nullable: true
  })
  people?: PersonOrderByRelationAggregateInput | undefined;
}
