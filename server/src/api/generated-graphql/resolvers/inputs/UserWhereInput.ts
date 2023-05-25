import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { BoolFilter } from './BoolFilter';
import { CompanyListRelationFilter } from './CompanyListRelationFilter';
import { DateTimeFilter } from './DateTimeFilter';
import { DateTimeNullableFilter } from './DateTimeNullableFilter';
import { JsonNullableFilter } from './JsonNullableFilter';
import { RefreshTokenListRelationFilter } from './RefreshTokenListRelationFilter';
import { StringFilter } from './StringFilter';
import { StringNullableFilter } from './StringNullableFilter';
import { WorkspaceMemberRelationFilter } from './WorkspaceMemberRelationFilter';

@TypeGraphQL.InputType('UserWhereInput', {
  isAbstract: true,
})
export class UserWhereInput {
  @TypeGraphQL.Field((_type) => [UserWhereInput], {
    nullable: true,
  })
  AND?: UserWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [UserWhereInput], {
    nullable: true,
  })
  OR?: UserWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [UserWhereInput], {
    nullable: true,
  })
  NOT?: UserWhereInput[] | undefined;

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

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  lastSeen?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => BoolFilter, {
    nullable: true,
  })
  disabled?: BoolFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  displayName?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  email?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  avatarUrl?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  locale?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  phoneNumber?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringNullableFilter, {
    nullable: true,
  })
  passwordHash?: StringNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => BoolFilter, {
    nullable: true,
  })
  emailVerified?: BoolFilter | undefined;

  @TypeGraphQL.Field((_type) => JsonNullableFilter, {
    nullable: true,
  })
  metadata?: JsonNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceMemberRelationFilter, {
    nullable: true,
  })
  WorkspaceMember?: WorkspaceMemberRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => CompanyListRelationFilter, {
    nullable: true,
  })
  companies?: CompanyListRelationFilter | undefined;

  @TypeGraphQL.Field((_type) => RefreshTokenListRelationFilter, {
    nullable: true,
  })
  RefreshTokens?: RefreshTokenListRelationFilter | undefined;
}
