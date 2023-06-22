import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadTargetWhereInput } from './comment-thread-target-where.input';
import { Type } from 'class-transformer';
import { CommentThreadTargetOrderByWithAggregationInput } from './comment-thread-target-order-by-with-aggregation.input';
import { CommentThreadTargetScalarFieldEnum } from './comment-thread-target-scalar-field.enum';
import { CommentThreadTargetScalarWhereWithAggregatesInput } from './comment-thread-target-scalar-where-with-aggregates.input';
import { Int } from '@nestjs/graphql';
import { CommentThreadTargetCountAggregateInput } from './comment-thread-target-count-aggregate.input';
import { CommentThreadTargetMinAggregateInput } from './comment-thread-target-min-aggregate.input';
import { CommentThreadTargetMaxAggregateInput } from './comment-thread-target-max-aggregate.input';

@ArgsType()
export class CommentThreadTargetGroupByArgs {

    @Field(() => CommentThreadTargetWhereInput, {nullable:true})
    @Type(() => CommentThreadTargetWhereInput)
    where?: CommentThreadTargetWhereInput;

    @Field(() => [CommentThreadTargetOrderByWithAggregationInput], {nullable:true})
    orderBy?: Array<CommentThreadTargetOrderByWithAggregationInput>;

    @Field(() => [CommentThreadTargetScalarFieldEnum], {nullable:false})
    by!: Array<keyof typeof CommentThreadTargetScalarFieldEnum>;

    @Field(() => CommentThreadTargetScalarWhereWithAggregatesInput, {nullable:true})
    having?: CommentThreadTargetScalarWhereWithAggregatesInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => CommentThreadTargetCountAggregateInput, {nullable:true})
    _count?: CommentThreadTargetCountAggregateInput;

    @Field(() => CommentThreadTargetMinAggregateInput, {nullable:true})
    _min?: CommentThreadTargetMinAggregateInput;

    @Field(() => CommentThreadTargetMaxAggregateInput, {nullable:true})
    _max?: CommentThreadTargetMaxAggregateInput;
}
