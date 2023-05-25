import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { UserCountAggregate } from './UserCountAggregate';
import { UserMaxAggregate } from './UserMaxAggregate';
import { UserMinAggregate } from './UserMinAggregate';

@TypeGraphQL.ObjectType('AggregateUser', {
  isAbstract: true,
})
export class AggregateUser {
  @TypeGraphQL.Field((_type) => UserCountAggregate, {
    nullable: true,
  })
  _count!: UserCountAggregate | null;

  @TypeGraphQL.Field((_type) => UserMinAggregate, {
    nullable: true,
  })
  _min!: UserMinAggregate | null;

  @TypeGraphQL.Field((_type) => UserMaxAggregate, {
    nullable: true,
  })
  _max!: UserMaxAggregate | null;
}
