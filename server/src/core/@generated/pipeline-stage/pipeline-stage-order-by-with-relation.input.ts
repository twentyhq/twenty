import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressOrderByRelationAggregateInput } from '../pipeline-progress/pipeline-progress-order-by-relation-aggregate.input';
import { PipelineOrderByWithRelationInput } from '../pipeline/pipeline-order-by-with-relation.input';
import { WorkspaceOrderByWithRelationInput } from '../workspace/workspace-order-by-with-relation.input';

@InputType()
export class PipelineStageOrderByWithRelationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    name?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    type?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    color?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    pipelineId?: keyof typeof SortOrder;

    @HideField()
    workspaceId?: keyof typeof SortOrder;

    @HideField()
    deletedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => PipelineProgressOrderByRelationAggregateInput, {nullable:true})
    pipelineProgresses?: PipelineProgressOrderByRelationAggregateInput;

    @Field(() => PipelineOrderByWithRelationInput, {nullable:true})
    pipeline?: PipelineOrderByWithRelationInput;

    @HideField()
    workspace?: WorkspaceOrderByWithRelationInput;
}
