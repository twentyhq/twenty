import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { WorkspaceCountAggregate } from './workspace-count-aggregate.output';
import { WorkspaceMinAggregate } from './workspace-min-aggregate.output';
import { WorkspaceMaxAggregate } from './workspace-max-aggregate.output';

@ObjectType()
export class AggregateWorkspace {

    @Field(() => WorkspaceCountAggregate, {nullable:true})
    _count?: WorkspaceCountAggregate;

    @Field(() => WorkspaceMinAggregate, {nullable:true})
    _min?: WorkspaceMinAggregate;

    @Field(() => WorkspaceMaxAggregate, {nullable:true})
    _max?: WorkspaceMaxAggregate;
}
