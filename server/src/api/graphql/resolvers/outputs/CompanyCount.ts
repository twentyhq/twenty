import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';

@TypeGraphQL.ObjectType('CompanyCount', {
  isAbstract: true,
})
export class CompanyCount {
  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  people!: number;
}
