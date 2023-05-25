import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeNullableWithAggregatesFilter } from '../inputs/DateTimeNullableWithAggregatesFilter';
import { DateTimeWithAggregatesFilter } from '../inputs/DateTimeWithAggregatesFilter';
import { StringWithAggregatesFilter } from '../inputs/StringWithAggregatesFilter';

@TypeGraphQL.InputType('WorkspaceScalarWhereWithAggregatesInput', {
  isAbstract: true,
})
export class WorkspaceScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field((_type) => [WorkspaceScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  AND?: WorkspaceScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [WorkspaceScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  OR?: WorkspaceScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [WorkspaceScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  NOT?: WorkspaceScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  id?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeWithAggregatesFilter, {
    nullable: true,
  })
  createdAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeWithAggregatesFilter, {
    nullable: true,
  })
  updatedAt?: DateTimeWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableWithAggregatesFilter, {
    nullable: true,
  })
  deletedAt?: DateTimeNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  domainName?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  displayName?: StringWithAggregatesFilter | undefined;
}
