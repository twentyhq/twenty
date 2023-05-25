import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceCountAggregate } from './WorkspaceCountAggregate';
import { WorkspaceMaxAggregate } from './WorkspaceMaxAggregate';
import { WorkspaceMinAggregate } from './WorkspaceMinAggregate';

@TypeGraphQL.ObjectType('WorkspaceGroupBy', {
  isAbstract: true,
})
export class WorkspaceGroupBy {
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
  domainName!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  displayName!: string;

  @TypeGraphQL.Field((_type) => WorkspaceCountAggregate, {
    nullable: true,
  })
  _count!: WorkspaceCountAggregate | null;

  @TypeGraphQL.Field((_type) => WorkspaceMinAggregate, {
    nullable: true,
  })
  _min!: WorkspaceMinAggregate | null;

  @TypeGraphQL.Field((_type) => WorkspaceMaxAggregate, {
    nullable: true,
  })
  _max!: WorkspaceMaxAggregate | null;
}
