import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { CommentThreadTargetCountAggregate } from './comment-thread-target-count-aggregate.output';
import { CommentThreadTargetMinAggregate } from './comment-thread-target-min-aggregate.output';
import { CommentThreadTargetMaxAggregate } from './comment-thread-target-max-aggregate.output';

@ObjectType()
export class AggregateCommentThreadTarget {
  @Field(() => CommentThreadTargetCountAggregate, { nullable: true })
  _count?: CommentThreadTargetCountAggregate;

  @Field(() => CommentThreadTargetMinAggregate, { nullable: true })
  _min?: CommentThreadTargetMinAggregate;

  @Field(() => CommentThreadTargetMaxAggregate, { nullable: true })
  _max?: CommentThreadTargetMaxAggregate;
}
