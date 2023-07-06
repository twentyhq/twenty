import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { HideField } from '@nestjs/graphql';
import { SortOrderInput } from '../prisma/sort-order.input';
import { PipelineCountOrderByAggregateInput } from './pipeline-count-order-by-aggregate.input';
import { PipelineMaxOrderByAggregateInput } from './pipeline-max-order-by-aggregate.input';
import { PipelineMinOrderByAggregateInput } from './pipeline-min-order-by-aggregate.input';

@InputType()
export class PipelineOrderByWithAggregationInput {

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

    @Field(() => PipelineCountOrderByAggregateInput, {nullable:true})
    _count?: PipelineCountOrderByAggregateInput;

    @Field(() => PipelineMaxOrderByAggregateInput, {nullable:true})
    _max?: PipelineMaxOrderByAggregateInput;

    @Field(() => PipelineMinOrderByAggregateInput, {nullable:true})
    _min?: PipelineMinOrderByAggregateInput;
}
