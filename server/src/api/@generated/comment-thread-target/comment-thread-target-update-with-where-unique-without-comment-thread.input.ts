import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadTargetWhereUniqueInput } from './comment-thread-target-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadTargetUpdateWithoutCommentThreadInput } from './comment-thread-target-update-without-comment-thread.input';

@InputType()
export class CommentThreadTargetUpdateWithWhereUniqueWithoutCommentThreadInput {
  @Field(() => CommentThreadTargetWhereUniqueInput, { nullable: false })
  @Type(() => CommentThreadTargetWhereUniqueInput)
  where!: CommentThreadTargetWhereUniqueInput;

  @Field(() => CommentThreadTargetUpdateWithoutCommentThreadInput, {
    nullable: false,
  })
  @Type(() => CommentThreadTargetUpdateWithoutCommentThreadInput)
  data!: CommentThreadTargetUpdateWithoutCommentThreadInput;
}
