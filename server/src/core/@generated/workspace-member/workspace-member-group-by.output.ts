import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { WorkspaceMemberCountAggregate } from './workspace-member-count-aggregate.output';
import { WorkspaceMemberMinAggregate } from './workspace-member-min-aggregate.output';
import { WorkspaceMemberMaxAggregate } from './workspace-member-max-aggregate.output';

@ObjectType()
export class WorkspaceMemberGroupBy {
  @Field(() => String, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date | string;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => String, { nullable: false })
  userId!: string;

  @HideField()
  workspaceId!: string;

  @Field(() => WorkspaceMemberCountAggregate, { nullable: true })
  _count?: WorkspaceMemberCountAggregate;

  @Field(() => WorkspaceMemberMinAggregate, { nullable: true })
  _min?: WorkspaceMemberMinAggregate;

  @Field(() => WorkspaceMemberMaxAggregate, { nullable: true })
  _max?: WorkspaceMemberMaxAggregate;
}
