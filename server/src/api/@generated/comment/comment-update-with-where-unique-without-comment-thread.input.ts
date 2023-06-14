import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';
import { CommentUpdateWithoutCommentThreadInput } from './comment-update-without-comment-thread.input';

@InputType()
export class CommentUpdateWithWhereUniqueWithoutCommentThreadInput {
  @Field(() => CommentWhereUniqueInput, { nullable: false })
  @Type(() => CommentWhereUniqueInput)
  where!: CommentWhereUniqueInput;

  @Field(() => CommentUpdateWithoutCommentThreadInput, { nullable: false })
  @Type(() => CommentUpdateWithoutCommentThreadInput)
  data!: CommentUpdateWithoutCommentThreadInput;
}
