import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Workspace as WorkspaceDB } from '@prisma/client';

@ObjectType()
export class Workspace {
  @Field(() => String)
  id: WorkspaceDB[`id`];

  @Field(() => GraphQLISODateTime)
  createdAt: WorkspaceDB[`createdAt`];

  @Field(() => GraphQLISODateTime)
  updatedAt: WorkspaceDB[`updatedAt`];

  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt: WorkspaceDB[`deletedAt`];
}