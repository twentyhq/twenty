import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyOrderByRelationAggregateInput } from './CompanyOrderByRelationAggregateInput';
import { RefreshTokenOrderByRelationAggregateInput } from './RefreshTokenOrderByRelationAggregateInput';
import { WorkspaceMemberOrderByWithRelationInput } from './WorkspaceMemberOrderByWithRelationInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('UserOrderByWithRelationInput', {
  isAbstract: true,
})
export class UserOrderByWithRelationInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  id?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  createdAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  updatedAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  deletedAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  lastSeen?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  disabled?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  displayName?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  email?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  avatarUrl?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  locale?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  phoneNumber?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  passwordHash?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  emailVerified?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  metadata?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceMemberOrderByWithRelationInput, {
    nullable: true,
  })
  WorkspaceMember?: WorkspaceMemberOrderByWithRelationInput | undefined;

  @TypeGraphQL.Field((_type) => CompanyOrderByRelationAggregateInput, {
    nullable: true,
  })
  companies?: CompanyOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => RefreshTokenOrderByRelationAggregateInput, {
    nullable: true,
  })
  RefreshTokens?: RefreshTokenOrderByRelationAggregateInput | undefined;
}
