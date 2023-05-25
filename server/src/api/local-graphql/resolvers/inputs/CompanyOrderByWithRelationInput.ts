import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { PersonOrderByRelationAggregateInput } from './PersonOrderByRelationAggregateInput';
import { UserOrderByWithRelationInput } from './UserOrderByWithRelationInput';
import { WorkspaceOrderByWithRelationInput } from './WorkspaceOrderByWithRelationInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('CompanyOrderByWithRelationInput', {
  isAbstract: true,
})
export class CompanyOrderByWithRelationInput {
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
  name?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  domainName?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  address?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  employees?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  accountOwnerId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  workspaceId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => UserOrderByWithRelationInput, {
    nullable: true,
  })
  accountOwner?: UserOrderByWithRelationInput | undefined;

  @TypeGraphQL.Field((_type) => PersonOrderByRelationAggregateInput, {
    nullable: true,
  })
  people?: PersonOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceOrderByWithRelationInput, {
    nullable: true,
  })
  workspace?: WorkspaceOrderByWithRelationInput | undefined;
}
