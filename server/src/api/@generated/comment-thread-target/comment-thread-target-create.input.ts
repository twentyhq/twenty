import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentableType } from '../prisma/commentable-type.enum';
import { CommentThreadCreateNestedOneWithoutCommentThreadTargetsInput } from '../comment-thread/comment-thread-create-nested-one-without-comment-thread-targets.input';

@InputType()
export class CommentThreadTargetCreateInput {
  @Field(() => String, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => CommentableType, { nullable: false })
  commentableType!: keyof typeof CommentableType;

  @Field(() => String, { nullable: false })
  commentableId!: string;

  @Field(() => CommentThreadCreateNestedOneWithoutCommentThreadTargetsInput, {
    nullable: false,
  })
  commentThread!: CommentThreadCreateNestedOneWithoutCommentThreadTargetsInput;
}
