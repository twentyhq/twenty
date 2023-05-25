import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyRelationFilter } from './CompanyRelationFilter';
import { DateTimeFilter } from './DateTimeFilter';
import { DateTimeNullableFilter } from './DateTimeNullableFilter';
import { StringFilter } from './StringFilter';
import { StringNullableFilter } from './StringNullableFilter';
import { WorkspaceRelationFilter } from './WorkspaceRelationFilter';

@TypeGraphQL.InputType('PersonWhereInput', {
  isAbstract: true,
})
export class PersonWhereInput {
  @TypeGraphQL.Field((_type) => [PersonWhereInput], {
    nullable: true,
  })
  AND?: PersonWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [PersonWhereInput], {
    nullable: true,
  })
  OR?: PersonWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [PersonWhereInput], {
    nullable: true,
  })
  NOT?: PersonWhereInput[] | undefined;

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
  firstname?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  lastname?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  email?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  phone?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  city?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  companyId?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  workspaceId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => CompanyRelationFilter, {
    nullable: true,
  })
  company?: CompanyRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceRelationFilter, {
    nullable: true,
  })
  workspace?: WorkspaceRelationFilter | undefined;
}
