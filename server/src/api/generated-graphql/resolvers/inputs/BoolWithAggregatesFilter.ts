import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { NestedBoolFilter } from './NestedBoolFilter';
import { NestedBoolWithAggregatesFilter } from './NestedBoolWithAggregatesFilter';
import { NestedIntFilter } from './NestedIntFilter';

@TypeGraphQL.InputType('BoolWithAggregatesFilter', {
  isAbstract: true,
})
export class BoolWithAggregatesFilter {
  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  equals?: boolean | undefined;

  @TypeGraphQL.Field((_type) => NestedBoolWithAggregatesFilter, {
    nullable: true,
  })
  not?: NestedBoolWithAggregatesFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedIntFilter, {
    nullable: true,
  })
  _count?: NestedIntFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedBoolFilter, {
    nullable: true,
  })
  _min?: NestedBoolFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedBoolFilter, {
    nullable: true,
  })
  _max?: NestedBoolFilter | undefined;
}
