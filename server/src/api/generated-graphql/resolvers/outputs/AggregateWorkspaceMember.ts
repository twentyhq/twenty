import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceMemberCountAggregate } from './WorkspaceMemberCountAggregate';
import { WorkspaceMemberMaxAggregate } from './WorkspaceMemberMaxAggregate';
import { WorkspaceMemberMinAggregate } from './WorkspaceMemberMinAggregate';

@TypeGraphQL.ObjectType('AggregateWorkspaceMember', {
  isAbstract: true,
})
export class AggregateWorkspaceMember {
  @TypeGraphQL.Field((_type) => WorkspaceMemberCountAggregate, {
    nullable: true,
  })
  _count!: WorkspaceMemberCountAggregate | null;

  @TypeGraphQL.Field((_type) => WorkspaceMemberMinAggregate, {
    nullable: true,
  })
  _min!: WorkspaceMemberMinAggregate | null;

  @TypeGraphQL.Field((_type) => WorkspaceMemberMaxAggregate, {
    nullable: true,
  })
  _max!: WorkspaceMemberMaxAggregate | null;
}
