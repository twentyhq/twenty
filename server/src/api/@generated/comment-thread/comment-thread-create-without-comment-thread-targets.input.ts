import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateNestedManyWithoutCommentThreadInput } from '../comment/comment-create-nested-many-without-comment-thread.input';
import { WorkspaceCreateNestedOneWithoutCommentThreadsInput } from '../workspace/workspace-create-nested-one-without-comment-threads.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CommentThreadCreateWithoutCommentThreadTargetsInput {
  @Field(() => String, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => CommentCreateNestedManyWithoutCommentThreadInput, {
    nullable: true,
  })
  comments?: CommentCreateNestedManyWithoutCommentThreadInput;

  @HideField()
  workspace!: WorkspaceCreateNestedOneWithoutCommentThreadsInput;
}
