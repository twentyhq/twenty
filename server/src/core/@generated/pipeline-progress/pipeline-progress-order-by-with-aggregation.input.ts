import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { SortOrderInput } from '../prisma/sort-order.input';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressCountOrderByAggregateInput } from './pipeline-progress-count-order-by-aggregate.input';
import { PipelineProgressAvgOrderByAggregateInput } from './pipeline-progress-avg-order-by-aggregate.input';
import { PipelineProgressMaxOrderByAggregateInput } from './pipeline-progress-max-order-by-aggregate.input';
import { PipelineProgressMinOrderByAggregateInput } from './pipeline-progress-min-order-by-aggregate.input';
import { PipelineProgressSumOrderByAggregateInput } from './pipeline-progress-sum-order-by-aggregate.input';

@InputType()
export class PipelineProgressOrderByWithAggregationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrderInput, {nullable:true})
    amount?: SortOrderInput;

    @Field(() => SortOrderInput, {nullable:true})
    closeDate?: SortOrderInput;

    @Field(() => SortOrderInput, {nullable:true})
    probability?: SortOrderInput;

    @Field(() => SortOrderInput, {nullable:true})
    recurring?: SortOrderInput;

    @Field(() => SortOrder, {nullable:true})
    pipelineId?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    pipelineStageId?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    progressableType?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    progressableId?: keyof typeof SortOrder;

    @HideField()
    workspaceId?: keyof typeof SortOrder;

    @HideField()
    deletedAt?: SortOrderInput;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => PipelineProgressCountOrderByAggregateInput, {nullable:true})
    _count?: PipelineProgressCountOrderByAggregateInput;

    @Field(() => PipelineProgressAvgOrderByAggregateInput, {nullable:true})
    _avg?: PipelineProgressAvgOrderByAggregateInput;

    @Field(() => PipelineProgressMaxOrderByAggregateInput, {nullable:true})
    _max?: PipelineProgressMaxOrderByAggregateInput;

    @Field(() => PipelineProgressMinOrderByAggregateInput, {nullable:true})
    _min?: PipelineProgressMinOrderByAggregateInput;

    @Field(() => PipelineProgressSumOrderByAggregateInput, {nullable:true})
    _sum?: PipelineProgressSumOrderByAggregateInput;
}
