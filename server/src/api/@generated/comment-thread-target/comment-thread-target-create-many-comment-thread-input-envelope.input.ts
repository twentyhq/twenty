import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadTargetCreateManyCommentThreadInput } from './comment-thread-target-create-many-comment-thread.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentThreadTargetCreateManyCommentThreadInputEnvelope {
  @Field(() => [CommentThreadTargetCreateManyCommentThreadInput], {
    nullable: false,
  })
  @Type(() => CommentThreadTargetCreateManyCommentThreadInput)
  data!: Array<CommentThreadTargetCreateManyCommentThreadInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
