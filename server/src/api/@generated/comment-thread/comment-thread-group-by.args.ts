import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadWhereInput } from './comment-thread-where.input';
import { Type } from 'class-transformer';
import { CommentThreadOrderByWithAggregationInput } from './comment-thread-order-by-with-aggregation.input';
import { CommentThreadScalarFieldEnum } from './comment-thread-scalar-field.enum';
import { CommentThreadScalarWhereWithAggregatesInput } from './comment-thread-scalar-where-with-aggregates.input';
import { Int } from '@nestjs/graphql';
import { CommentThreadCountAggregateInput } from './comment-thread-count-aggregate.input';
import { CommentThreadMinAggregateInput } from './comment-thread-min-aggregate.input';
import { CommentThreadMaxAggregateInput } from './comment-thread-max-aggregate.input';

@ArgsType()
export class CommentThreadGroupByArgs {
  @Field(() => CommentThreadWhereInput, { nullable: true })
  @Type(() => CommentThreadWhereInput)
  where?: CommentThreadWhereInput;

  @Field(() => [CommentThreadOrderByWithAggregationInput], { nullable: true })
  orderBy?: Array<CommentThreadOrderByWithAggregationInput>;

  @Field(() => [CommentThreadScalarFieldEnum], { nullable: false })
  by!: Array<keyof typeof CommentThreadScalarFieldEnum>;

  @Field(() => CommentThreadScalarWhereWithAggregatesInput, { nullable: true })
  having?: CommentThreadScalarWhereWithAggregatesInput;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => CommentThreadCountAggregateInput, { nullable: true })
  _count?: CommentThreadCountAggregateInput;

  @Field(() => CommentThreadMinAggregateInput, { nullable: true })
  _min?: CommentThreadMinAggregateInput;

  @Field(() => CommentThreadMaxAggregateInput, { nullable: true })
  _max?: CommentThreadMaxAggregateInput;
}
