import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceMemberCountAggregate } from '../outputs/WorkspaceMemberCountAggregate';
import { WorkspaceMemberMaxAggregate } from '../outputs/WorkspaceMemberMaxAggregate';
import { WorkspaceMemberMinAggregate } from '../outputs/WorkspaceMemberMinAggregate';

@TypeGraphQL.ObjectType('WorkspaceMemberGroupBy', {
  isAbstract: true,
})
export class WorkspaceMemberGroupBy {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deletedAt!: Date | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  userId!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  workspaceId!: string;

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
