import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { WorkspaceCountOrderByAggregateInput } from './workspace-count-order-by-aggregate.input';
import { WorkspaceMaxOrderByAggregateInput } from './workspace-max-order-by-aggregate.input';
import { WorkspaceMinOrderByAggregateInput } from './workspace-min-order-by-aggregate.input';

@InputType()
export class WorkspaceOrderByWithAggregationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    deletedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    domainName?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    displayName?: keyof typeof SortOrder;

    @Field(() => WorkspaceCountOrderByAggregateInput, {nullable:true})
    _count?: WorkspaceCountOrderByAggregateInput;

    @Field(() => WorkspaceMaxOrderByAggregateInput, {nullable:true})
    _max?: WorkspaceMaxOrderByAggregateInput;

    @Field(() => WorkspaceMinOrderByAggregateInput, {nullable:true})
    _min?: WorkspaceMinOrderByAggregateInput;
}
