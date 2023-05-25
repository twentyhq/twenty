import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DateTimeNullableWithAggregatesFilter } from "../inputs/DateTimeNullableWithAggregatesFilter";
import { DateTimeWithAggregatesFilter } from "../inputs/DateTimeWithAggregatesFilter";
import { StringWithAggregatesFilter } from "../inputs/StringWithAggregatesFilter";

@TypeGraphQL.InputType("WorkspaceMemberScalarWhereWithAggregatesInput", {
  isAbstract: true
})
export class WorkspaceMemberScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field(_type => [WorkspaceMemberScalarWhereWithAggregatesInput], {
    nullable: true
  })
  AND?: WorkspaceMemberScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [WorkspaceMemberScalarWhereWithAggregatesInput], {
    nullable: true
  })
  OR?: WorkspaceMemberScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => [WorkspaceMemberScalarWhereWithAggregatesInput], {
    nullable: true
  })
  NOT?: WorkspaceMemberScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  id?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  createdAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeWithAggregatesFilter, {
    nullable: true
  })
  updatedAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => DateTimeNullableWithAggregatesFilter, {
    nullable: true
  })
  deletedAt?: DateTimeNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  userId?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => StringWithAggregatesFilter, {
    nullable: true
  })
  workspaceId?: StringWithAggregatesFilter | undefined;
}
