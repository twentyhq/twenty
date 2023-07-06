import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { HideField } from '@nestjs/graphql';
import { SortOrderInput } from '../prisma/sort-order.input';
import { PipelineStageOrderByRelationAggregateInput } from '../pipeline-stage/pipeline-stage-order-by-relation-aggregate.input';
import { PipelineProgressOrderByRelationAggregateInput } from '../pipeline-progress/pipeline-progress-order-by-relation-aggregate.input';
import { WorkspaceOrderByWithRelationInput } from '../workspace/workspace-order-by-with-relation.input';

@InputType()
export class PipelineOrderByWithRelationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    name?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    icon?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    pipelineProgressableType?: keyof typeof SortOrder;

    @HideField()
    workspaceId?: keyof typeof SortOrder;

    @HideField()
    deletedAt?: SortOrderInput;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => PipelineStageOrderByRelationAggregateInput, {nullable:true})
    pipelineStages?: PipelineStageOrderByRelationAggregateInput;

    @Field(() => PipelineProgressOrderByRelationAggregateInput, {nullable:true})
    pipelineProgresses?: PipelineProgressOrderByRelationAggregateInput;

    @HideField()
    workspace?: WorkspaceOrderByWithRelationInput;
}
