import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentableType } from '../prisma/commentable-type.enum';

@InputType()
export class CommentThreadTargetCreateManyInput {
  @Field(() => String, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => String, { nullable: false })
  commentThreadId!: string;

  @Field(() => CommentableType, { nullable: false })
  commentableType!: keyof typeof CommentableType;

  @Field(() => String, { nullable: false })
  commentableId!: string;
}
