import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { WorkspaceMemberCountAggregate } from './workspace-member-count-aggregate.output';
import { WorkspaceMemberMinAggregate } from './workspace-member-min-aggregate.output';
import { WorkspaceMemberMaxAggregate } from './workspace-member-max-aggregate.output';

@ObjectType()
export class AggregateWorkspaceMember {
  @Field(() => WorkspaceMemberCountAggregate, { nullable: true })
  _count?: WorkspaceMemberCountAggregate;

  @Field(() => WorkspaceMemberMinAggregate, { nullable: true })
  _min?: WorkspaceMemberMinAggregate;

  @Field(() => WorkspaceMemberMaxAggregate, { nullable: true })
  _max?: WorkspaceMemberMaxAggregate;
}
