import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { HideField } from '@nestjs/graphql';
import { PipelineStageCountOrderByAggregateInput } from './pipeline-stage-count-order-by-aggregate.input';
import { PipelineStageMaxOrderByAggregateInput } from './pipeline-stage-max-order-by-aggregate.input';
import { PipelineStageMinOrderByAggregateInput } from './pipeline-stage-min-order-by-aggregate.input';

@InputType()
export class PipelineStageOrderByWithAggregationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    deletedAt?: keyof typeof SortOrder;

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

    @Field(() => PipelineStageCountOrderByAggregateInput, {nullable:true})
    _count?: PipelineStageCountOrderByAggregateInput;

    @Field(() => PipelineStageMaxOrderByAggregateInput, {nullable:true})
    _max?: PipelineStageMaxOrderByAggregateInput;

    @Field(() => PipelineStageMinOrderByAggregateInput, {nullable:true})
    _min?: PipelineStageMinOrderByAggregateInput;
}
