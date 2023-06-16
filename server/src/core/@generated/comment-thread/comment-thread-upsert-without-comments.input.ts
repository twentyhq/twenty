import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadUpdateWithoutCommentsInput } from './comment-thread-update-without-comments.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateWithoutCommentsInput } from './comment-thread-create-without-comments.input';

@InputType()
export class CommentThreadUpsertWithoutCommentsInput {
  @Field(() => CommentThreadUpdateWithoutCommentsInput, { nullable: false })
  @Type(() => CommentThreadUpdateWithoutCommentsInput)
  update!: CommentThreadUpdateWithoutCommentsInput;

  @Field(() => CommentThreadCreateWithoutCommentsInput, { nullable: false })
  @Type(() => CommentThreadCreateWithoutCommentsInput)
  create!: CommentThreadCreateWithoutCommentsInput;
}
