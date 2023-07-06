import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { HideField } from '@nestjs/graphql';
import { SortOrderInput } from '../prisma/sort-order.input';
import { CommentThreadCountOrderByAggregateInput } from './comment-thread-count-order-by-aggregate.input';
import { CommentThreadMaxOrderByAggregateInput } from './comment-thread-max-order-by-aggregate.input';
import { CommentThreadMinOrderByAggregateInput } from './comment-thread-min-order-by-aggregate.input';

@InputType()
export class CommentThreadOrderByWithAggregationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @HideField()
    workspaceId?: keyof typeof SortOrder;

    @HideField()
    deletedAt?: SortOrderInput;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => CommentThreadCountOrderByAggregateInput, {nullable:true})
    _count?: CommentThreadCountOrderByAggregateInput;

    @Field(() => CommentThreadMaxOrderByAggregateInput, {nullable:true})
    _max?: CommentThreadMaxOrderByAggregateInput;

    @Field(() => CommentThreadMinOrderByAggregateInput, {nullable:true})
    _min?: CommentThreadMinOrderByAggregateInput;
}
