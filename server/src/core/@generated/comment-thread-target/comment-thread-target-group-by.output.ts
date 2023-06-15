import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { CommentableType } from '../prisma/commentable-type.enum';
import { CommentThreadTargetCountAggregate } from './comment-thread-target-count-aggregate.output';
import { CommentThreadTargetMinAggregate } from './comment-thread-target-min-aggregate.output';
import { CommentThreadTargetMaxAggregate } from './comment-thread-target-max-aggregate.output';

@ObjectType()
export class CommentThreadTargetGroupBy {
  @Field(() => String, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date | string;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => String, { nullable: false })
  commentThreadId!: string;

  @Field(() => CommentableType, { nullable: false })
  commentableType!: keyof typeof CommentableType;

  @Field(() => String, { nullable: false })
  commentableId!: string;

  @Field(() => CommentThreadTargetCountAggregate, { nullable: true })
  _count?: CommentThreadTargetCountAggregate;

  @Field(() => CommentThreadTargetMinAggregate, { nullable: true })
  _min?: CommentThreadTargetMinAggregate;

  @Field(() => CommentThreadTargetMaxAggregate, { nullable: true })
  _max?: CommentThreadTargetMaxAggregate;
}
