import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { CommentCountAggregate } from './comment-count-aggregate.output';
import { CommentMinAggregate } from './comment-min-aggregate.output';
import { CommentMaxAggregate } from './comment-max-aggregate.output';

@ObjectType()
export class CommentGroupBy {
  @Field(() => String, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date | string;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => String, { nullable: false })
  body!: string;

  @Field(() => String, { nullable: false })
  authorId!: string;

  @Field(() => String, { nullable: false })
  commentThreadId!: string;

  @HideField()
  workspaceId!: string;

  @Field(() => CommentCountAggregate, { nullable: true })
  _count?: CommentCountAggregate;

  @Field(() => CommentMinAggregate, { nullable: true })
  _min?: CommentMinAggregate;

  @Field(() => CommentMaxAggregate, { nullable: true })
  _max?: CommentMaxAggregate;
}
