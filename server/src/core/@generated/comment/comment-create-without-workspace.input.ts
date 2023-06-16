import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateNestedOneWithoutCommentsInput } from '../user/user-create-nested-one-without-comments.input';
import { CommentThreadCreateNestedOneWithoutCommentsInput } from '../comment-thread/comment-thread-create-nested-one-without-comments.input';

@InputType()
export class CommentCreateWithoutWorkspaceInput {
  @Field(() => String, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => String, { nullable: false })
  body!: string;

  @Field(() => UserCreateNestedOneWithoutCommentsInput, { nullable: false })
  author!: UserCreateNestedOneWithoutCommentsInput;

  @Field(() => CommentThreadCreateNestedOneWithoutCommentsInput, {
    nullable: false,
  })
  commentThread!: CommentThreadCreateNestedOneWithoutCommentsInput;
}
