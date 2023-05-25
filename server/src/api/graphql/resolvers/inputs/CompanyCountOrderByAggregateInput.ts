import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('CompanyCountOrderByAggregateInput', {
  isAbstract: true,
})
export class CompanyCountOrderByAggregateInput {
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
}
