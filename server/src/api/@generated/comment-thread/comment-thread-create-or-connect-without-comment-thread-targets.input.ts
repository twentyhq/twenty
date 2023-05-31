import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateWithoutCommentThreadTargetsInput } from './comment-thread-create-without-comment-thread-targets.input';

@InputType()
export class CommentThreadCreateOrConnectWithoutCommentThreadTargetsInput {
  @Field(() => CommentThreadWhereUniqueInput, { nullable: false })
  @Type(() => CommentThreadWhereUniqueInput)
  where!: CommentThreadWhereUniqueInput;

  @Field(() => CommentThreadCreateWithoutCommentThreadTargetsInput, {
    nullable: false,
  })
  @Type(() => CommentThreadCreateWithoutCommentThreadTargetsInput)
  create!: CommentThreadCreateWithoutCommentThreadTargetsInput;
}
