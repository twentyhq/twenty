import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceMemberCountOrderByAggregateInput } from './WorkspaceMemberCountOrderByAggregateInput';
import { WorkspaceMemberMaxOrderByAggregateInput } from './WorkspaceMemberMaxOrderByAggregateInput';
import { WorkspaceMemberMinOrderByAggregateInput } from './WorkspaceMemberMinOrderByAggregateInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('WorkspaceMemberOrderByWithAggregationInput', {
  isAbstract: true,
})
export class WorkspaceMemberOrderByWithAggregationInput {
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
  userId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  workspaceId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceMemberCountOrderByAggregateInput, {
    nullable: true,
  })
  _count?: WorkspaceMemberCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceMemberMaxOrderByAggregateInput, {
    nullable: true,
  })
  _max?: WorkspaceMemberMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceMemberMinOrderByAggregateInput, {
    nullable: true,
  })
  _min?: WorkspaceMemberMinOrderByAggregateInput | undefined;
}
