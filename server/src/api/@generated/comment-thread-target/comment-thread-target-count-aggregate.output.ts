import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';

@ObjectType()
export class CommentThreadTargetCountAggregate {
  @Field(() => Int, { nullable: false })
  id!: number;

  @Field(() => Int, { nullable: false })
  createdAt!: number;

  @Field(() => Int, { nullable: false })
  updatedAt!: number;

  @Field(() => Int, { nullable: false })
  deletedAt!: number;

  @Field(() => Int, { nullable: false })
  commentThreadId!: number;

  @Field(() => Int, { nullable: false })
  commentableType!: number;

  @Field(() => Int, { nullable: false })
  commentableId!: number;

  @Field(() => Int, { nullable: false })
  _all!: number;
}
