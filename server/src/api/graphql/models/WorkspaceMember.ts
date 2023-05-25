import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../scalars';
import { User } from '../models/User';
import { Workspace } from '../models/Workspace';

@TypeGraphQL.ObjectType('WorkspaceMember', {
  isAbstract: true,
})
export class WorkspaceMember {
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
  deletedAt?: Date | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  userId!: string;

  user?: User;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  workspaceId!: string;

  workspace?: Workspace;
}
