import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { WorkspaceMemberCountOrderByAggregateInput } from './workspace-member-count-order-by-aggregate.input';
import { WorkspaceMemberMaxOrderByAggregateInput } from './workspace-member-max-order-by-aggregate.input';
import { WorkspaceMemberMinOrderByAggregateInput } from './workspace-member-min-order-by-aggregate.input';

@InputType()
export class WorkspaceMemberOrderByWithAggregationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    deletedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    userId?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    workspaceId?: keyof typeof SortOrder;

    @Field(() => WorkspaceMemberCountOrderByAggregateInput, {nullable:true})
    _count?: WorkspaceMemberCountOrderByAggregateInput;

    @Field(() => WorkspaceMemberMaxOrderByAggregateInput, {nullable:true})
    _max?: WorkspaceMemberMaxOrderByAggregateInput;

    @Field(() => WorkspaceMemberMinOrderByAggregateInput, {nullable:true})
    _min?: WorkspaceMemberMinOrderByAggregateInput;
}
