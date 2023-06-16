import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutCommentsInput } from './comment-thread-create-without-comments.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateOrConnectWithoutCommentsInput } from './comment-thread-create-or-connect-without-comments.input';
import { CommentThreadUpsertWithoutCommentsInput } from './comment-thread-upsert-without-comments.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { CommentThreadUpdateWithoutCommentsInput } from './comment-thread-update-without-comments.input';

@InputType()
export class CommentThreadUpdateOneRequiredWithoutCommentsNestedInput {
  @Field(() => CommentThreadCreateWithoutCommentsInput, { nullable: true })
  @Type(() => CommentThreadCreateWithoutCommentsInput)
  create?: CommentThreadCreateWithoutCommentsInput;

  @Field(() => CommentThreadCreateOrConnectWithoutCommentsInput, {
    nullable: true,
  })
  @Type(() => CommentThreadCreateOrConnectWithoutCommentsInput)
  connectOrCreate?: CommentThreadCreateOrConnectWithoutCommentsInput;

  @Field(() => CommentThreadUpsertWithoutCommentsInput, { nullable: true })
  @Type(() => CommentThreadUpsertWithoutCommentsInput)
  upsert?: CommentThreadUpsertWithoutCommentsInput;

  @Field(() => CommentThreadWhereUniqueInput, { nullable: true })
  @Type(() => CommentThreadWhereUniqueInput)
  connect?: CommentThreadWhereUniqueInput;

  @Field(() => CommentThreadUpdateWithoutCommentsInput, { nullable: true })
  @Type(() => CommentThreadUpdateWithoutCommentsInput)
  update?: CommentThreadUpdateWithoutCommentsInput;
}
