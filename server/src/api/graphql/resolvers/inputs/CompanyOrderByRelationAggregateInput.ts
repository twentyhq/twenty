import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('CompanyOrderByRelationAggregateInput', {
  isAbstract: true,
})
export class CompanyOrderByRelationAggregateInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  _count?: 'asc' | 'desc' | undefined;
}
