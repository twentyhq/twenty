import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeNullableWithAggregatesFilter } from '../inputs/DateTimeNullableWithAggregatesFilter';
import { DateTimeWithAggregatesFilter } from '../inputs/DateTimeWithAggregatesFilter';
import { IntNullableWithAggregatesFilter } from '../inputs/IntNullableWithAggregatesFilter';
import { StringNullableWithAggregatesFilter } from '../inputs/StringNullableWithAggregatesFilter';
import { StringWithAggregatesFilter } from '../inputs/StringWithAggregatesFilter';

@TypeGraphQL.InputType('CompanyScalarWhereWithAggregatesInput', {
  isAbstract: true,
})
export class CompanyScalarWhereWithAggregatesInput {
  @TypeGraphQL.Field((_type) => [CompanyScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  AND?: CompanyScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [CompanyScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  OR?: CompanyScalarWhereWithAggregatesInput[] | undefined;

  @TypeGraphQL.Field((_type) => [CompanyScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  NOT?: CompanyScalarWhereWithAggregatesInput[] | undefined;

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
  name?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  domainName?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  address?: StringWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => IntNullableWithAggregatesFilter, {
    nullable: true,
  })
  employees?: IntNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableWithAggregatesFilter, {
    nullable: true,
  })
  accountOwnerId?: StringNullableWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => StringWithAggregatesFilter, {
    nullable: true,
  })
  workspaceId?: StringWithAggregatesFilter | undefined;
}
