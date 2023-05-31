import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { CommentableType } from '../prisma/commentable-type.enum';

@ObjectType()
export class CommentThreadTargetMinAggregate {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => String, { nullable: true })
  commentThreadId?: string;

  @Field(() => CommentableType, { nullable: true })
  commentableType?: keyof typeof CommentableType;

  @Field(() => String, { nullable: true })
  commentableId?: string;
}
