import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutCommentsInput } from './comment-thread-create-without-comments.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateOrConnectWithoutCommentsInput } from './comment-thread-create-or-connect-without-comments.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';

@InputType()
export class CommentThreadCreateNestedOneWithoutCommentsInput {
  @Field(() => CommentThreadCreateWithoutCommentsInput, { nullable: true })
  @Type(() => CommentThreadCreateWithoutCommentsInput)
  create?: CommentThreadCreateWithoutCommentsInput;

  @Field(() => CommentThreadCreateOrConnectWithoutCommentsInput, {
    nullable: true,
  })
  @Type(() => CommentThreadCreateOrConnectWithoutCommentsInput)
  connectOrCreate?: CommentThreadCreateOrConnectWithoutCommentsInput;

  @Field(() => CommentThreadWhereUniqueInput, { nullable: true })
  @Type(() => CommentThreadWhereUniqueInput)
  connect?: CommentThreadWhereUniqueInput;
}
