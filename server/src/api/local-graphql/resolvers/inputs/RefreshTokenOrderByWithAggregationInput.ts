import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RefreshTokenCountOrderByAggregateInput } from './RefreshTokenCountOrderByAggregateInput';
import { RefreshTokenMaxOrderByAggregateInput } from './RefreshTokenMaxOrderByAggregateInput';
import { RefreshTokenMinOrderByAggregateInput } from './RefreshTokenMinOrderByAggregateInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('RefreshTokenOrderByWithAggregationInput', {
  isAbstract: true,
})
export class RefreshTokenOrderByWithAggregationInput {
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
  refreshToken?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  userId?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => RefreshTokenCountOrderByAggregateInput, {
    nullable: true,
  })
  _count?: RefreshTokenCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => RefreshTokenMaxOrderByAggregateInput, {
    nullable: true,
  })
  _max?: RefreshTokenMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => RefreshTokenMinOrderByAggregateInput, {
    nullable: true,
  })
  _min?: RefreshTokenMinOrderByAggregateInput | undefined;
}
