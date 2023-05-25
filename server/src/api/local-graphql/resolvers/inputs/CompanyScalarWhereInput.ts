import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFilter } from './DateTimeFilter';
import { DateTimeNullableFilter } from './DateTimeNullableFilter';
import { IntNullableFilter } from './IntNullableFilter';
import { StringFilter } from './StringFilter';
import { StringNullableFilter } from './StringNullableFilter';

@TypeGraphQL.InputType('CompanyScalarWhereInput', {
  isAbstract: true,
})
export class CompanyScalarWhereInput {
  @TypeGraphQL.Field((_type) => [CompanyScalarWhereInput], {
    nullable: true,
  })
  AND?: CompanyScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [CompanyScalarWhereInput], {
    nullable: true,
  })
  OR?: CompanyScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [CompanyScalarWhereInput], {
    nullable: true,
  })
  NOT?: CompanyScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  updatedAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  deletedAt?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  name?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  domainName?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  address?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => IntNullableFilter, {
    nullable: true,
  })
  employees?: IntNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  accountOwnerId?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  workspaceId?: StringFilter | undefined;
}
