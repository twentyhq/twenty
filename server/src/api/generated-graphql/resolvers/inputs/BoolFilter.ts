import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { NestedBoolFilter } from './NestedBoolFilter';

@TypeGraphQL.InputType('BoolFilter', {
  isAbstract: true,
})
export class BoolFilter {
  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  equals?: boolean | undefined;

  @TypeGraphQL.Field((_type) => NestedBoolFilter, {
    nullable: true,
  })
  not?: NestedBoolFilter | undefined;
}
