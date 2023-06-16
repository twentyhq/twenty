import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadWhereInput } from './comment-thread-where.input';
import { Type } from 'class-transformer';
import { CommentThreadOrderByWithRelationInput } from './comment-thread-order-by-with-relation.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Int } from '@nestjs/graphql';
import { CommentThreadCountAggregateInput } from './comment-thread-count-aggregate.input';
import { CommentThreadMinAggregateInput } from './comment-thread-min-aggregate.input';
import { CommentThreadMaxAggregateInput } from './comment-thread-max-aggregate.input';

@ArgsType()
export class CommentThreadAggregateArgs {
  @Field(() => CommentThreadWhereInput, { nullable: true })
  @Type(() => CommentThreadWhereInput)
  where?: CommentThreadWhereInput;

  @Field(() => [CommentThreadOrderByWithRelationInput], { nullable: true })
  orderBy?: Array<CommentThreadOrderByWithRelationInput>;

  @Field(() => CommentThreadWhereUniqueInput, { nullable: true })
  cursor?: CommentThreadWhereUniqueInput;

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
