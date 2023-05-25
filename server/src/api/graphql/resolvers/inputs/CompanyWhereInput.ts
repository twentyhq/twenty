import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFilter } from '../inputs/DateTimeFilter';
import { DateTimeNullableFilter } from '../inputs/DateTimeNullableFilter';
import { IntNullableFilter } from '../inputs/IntNullableFilter';
import { PersonListRelationFilter } from '../inputs/PersonListRelationFilter';
import { StringFilter } from '../inputs/StringFilter';
import { StringNullableFilter } from '../inputs/StringNullableFilter';
import { UserRelationFilter } from '../inputs/UserRelationFilter';
import { WorkspaceRelationFilter } from '../inputs/WorkspaceRelationFilter';

@TypeGraphQL.InputType('CompanyWhereInput', {
  isAbstract: true,
})
export class CompanyWhereInput {
  @TypeGraphQL.Field((_type) => [CompanyWhereInput], {
    nullable: true,
  })
  AND?: CompanyWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [CompanyWhereInput], {
    nullable: true,
  })
  OR?: CompanyWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [CompanyWhereInput], {
    nullable: true,
  })
  NOT?: CompanyWhereInput[] | undefined;

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

  @TypeGraphQL.Field((_type) => UserRelationFilter, {
    nullable: true,
  })
  accountOwner?: UserRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => PersonListRelationFilter, {
    nullable: true,
  })
  people?: PersonListRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceRelationFilter, {
    nullable: true,
  })
  workspace?: WorkspaceRelationFilter | undefined;
}
