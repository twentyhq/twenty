import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { CommentThreadTargetCountOrderByAggregateInput } from './comment-thread-target-count-order-by-aggregate.input';
import { CommentThreadTargetMaxOrderByAggregateInput } from './comment-thread-target-max-order-by-aggregate.input';
import { CommentThreadTargetMinOrderByAggregateInput } from './comment-thread-target-min-order-by-aggregate.input';

@InputType()
export class CommentThreadTargetOrderByWithAggregationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    deletedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    commentThreadId?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    commentableType?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    commentableId?: keyof typeof SortOrder;

    @Field(() => CommentThreadTargetCountOrderByAggregateInput, {nullable:true})
    _count?: CommentThreadTargetCountOrderByAggregateInput;

    @Field(() => CommentThreadTargetMaxOrderByAggregateInput, {nullable:true})
    _max?: CommentThreadTargetMaxOrderByAggregateInput;

    @Field(() => CommentThreadTargetMinOrderByAggregateInput, {nullable:true})
    _min?: CommentThreadTargetMinOrderByAggregateInput;
}
