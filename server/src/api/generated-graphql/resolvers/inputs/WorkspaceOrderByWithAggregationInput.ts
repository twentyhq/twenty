import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceCountOrderByAggregateInput } from './WorkspaceCountOrderByAggregateInput';
import { WorkspaceMaxOrderByAggregateInput } from './WorkspaceMaxOrderByAggregateInput';
import { WorkspaceMinOrderByAggregateInput } from './WorkspaceMinOrderByAggregateInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('WorkspaceOrderByWithAggregationInput', {
  isAbstract: true,
})
export class WorkspaceOrderByWithAggregationInput {
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
  domainName?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  displayName?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceCountOrderByAggregateInput, {
    nullable: true,
  })
  _count?: WorkspaceCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceMaxOrderByAggregateInput, {
    nullable: true,
  })
  _max?: WorkspaceMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceMinOrderByAggregateInput, {
    nullable: true,
  })
  _min?: WorkspaceMinOrderByAggregateInput | undefined;
}
