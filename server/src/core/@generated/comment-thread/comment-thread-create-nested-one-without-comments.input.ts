import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutCommentsInput } from './comment-thread-create-without-comments.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateOrConnectWithoutCommentsInput } from './comment-thread-create-or-connect-without-comments.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentThreadCreateNestedOneWithoutCommentsInput {
  @HideField()
  create?: CommentThreadCreateWithoutCommentsInput;

  @HideField()
  connectOrCreate?: CommentThreadCreateOrConnectWithoutCommentsInput;

  @Field(() => CommentThreadWhereUniqueInput, { nullable: true })
  @Type(() => CommentThreadWhereUniqueInput)
  connect?: CommentThreadWhereUniqueInput;
}
