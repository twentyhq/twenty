import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadTargetWhereUniqueInput } from './comment-thread-target-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadTargetCreateWithoutCommentThreadInput } from './comment-thread-target-create-without-comment-thread.input';

@InputType()
export class CommentThreadTargetCreateOrConnectWithoutCommentThreadInput {
  @Field(() => CommentThreadTargetWhereUniqueInput, { nullable: false })
  @Type(() => CommentThreadTargetWhereUniqueInput)
  where!: CommentThreadTargetWhereUniqueInput;

  @Field(() => CommentThreadTargetCreateWithoutCommentThreadInput, {
    nullable: false,
  })
  @Type(() => CommentThreadTargetCreateWithoutCommentThreadInput)
  create!: CommentThreadTargetCreateWithoutCommentThreadInput;
}
