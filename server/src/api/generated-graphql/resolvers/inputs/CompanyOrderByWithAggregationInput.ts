import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyAvgOrderByAggregateInput } from './CompanyAvgOrderByAggregateInput';
import { CompanyCountOrderByAggregateInput } from './CompanyCountOrderByAggregateInput';
import { CompanyMaxOrderByAggregateInput } from './CompanyMaxOrderByAggregateInput';
import { CompanyMinOrderByAggregateInput } from './CompanyMinOrderByAggregateInput';
import { CompanySumOrderByAggregateInput } from './CompanySumOrderByAggregateInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('CompanyOrderByWithAggregationInput', {
  isAbstract: true,
})
export class CompanyOrderByWithAggregationInput {
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

  @TypeGraphQL.Field((_type) => CompanyCountOrderByAggregateInput, {
    nullable: true,
  })
  _count?: CompanyCountOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => CompanyAvgOrderByAggregateInput, {
    nullable: true,
  })
  _avg?: CompanyAvgOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => CompanyMaxOrderByAggregateInput, {
    nullable: true,
  })
  _max?: CompanyMaxOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => CompanyMinOrderByAggregateInput, {
    nullable: true,
  })
  _min?: CompanyMinOrderByAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => CompanySumOrderByAggregateInput, {
    nullable: true,
  })
  _sum?: CompanySumOrderByAggregateInput | undefined;
}
