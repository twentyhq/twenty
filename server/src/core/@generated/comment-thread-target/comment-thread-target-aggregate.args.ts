import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadTargetWhereInput } from './comment-thread-target-where.input';
import { Type } from 'class-transformer';
import { CommentThreadTargetOrderByWithRelationInput } from './comment-thread-target-order-by-with-relation.input';
import { CommentThreadTargetWhereUniqueInput } from './comment-thread-target-where-unique.input';
import { Int } from '@nestjs/graphql';
import { CommentThreadTargetCountAggregateInput } from './comment-thread-target-count-aggregate.input';
import { CommentThreadTargetMinAggregateInput } from './comment-thread-target-min-aggregate.input';
import { CommentThreadTargetMaxAggregateInput } from './comment-thread-target-max-aggregate.input';

@ArgsType()
export class CommentThreadTargetAggregateArgs {
  @Field(() => CommentThreadTargetWhereInput, { nullable: true })
  @Type(() => CommentThreadTargetWhereInput)
  where?: CommentThreadTargetWhereInput;

  @Field(() => [CommentThreadTargetOrderByWithRelationInput], {
    nullable: true,
  })
  orderBy?: Array<CommentThreadTargetOrderByWithRelationInput>;

  @Field(() => CommentThreadTargetWhereUniqueInput, { nullable: true })
  cursor?: CommentThreadTargetWhereUniqueInput;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => CommentThreadTargetCountAggregateInput, { nullable: true })
  _count?: CommentThreadTargetCountAggregateInput;

  @Field(() => CommentThreadTargetMinAggregateInput, { nullable: true })
  _min?: CommentThreadTargetMinAggregateInput;

  @Field(() => CommentThreadTargetMaxAggregateInput, { nullable: true })
  _max?: CommentThreadTargetMaxAggregateInput;
}
