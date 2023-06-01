import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutCommentThreadTargetsInput } from './comment-thread-create-without-comment-thread-targets.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateOrConnectWithoutCommentThreadTargetsInput } from './comment-thread-create-or-connect-without-comment-thread-targets.input';
import { CommentThreadUpsertWithoutCommentThreadTargetsInput } from './comment-thread-upsert-without-comment-thread-targets.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { CommentThreadUpdateWithoutCommentThreadTargetsInput } from './comment-thread-update-without-comment-thread-targets.input';

@InputType()
export class CommentThreadUpdateOneRequiredWithoutCommentThreadTargetsNestedInput {
  @Field(() => CommentThreadCreateWithoutCommentThreadTargetsInput, {
    nullable: true,
  })
  @Type(() => CommentThreadCreateWithoutCommentThreadTargetsInput)
  create?: CommentThreadCreateWithoutCommentThreadTargetsInput;

  @Field(() => CommentThreadCreateOrConnectWithoutCommentThreadTargetsInput, {
    nullable: true,
  })
  @Type(() => CommentThreadCreateOrConnectWithoutCommentThreadTargetsInput)
  connectOrCreate?: CommentThreadCreateOrConnectWithoutCommentThreadTargetsInput;

  @Field(() => CommentThreadUpsertWithoutCommentThreadTargetsInput, {
    nullable: true,
  })
  @Type(() => CommentThreadUpsertWithoutCommentThreadTargetsInput)
  upsert?: CommentThreadUpsertWithoutCommentThreadTargetsInput;

  @Field(() => CommentThreadWhereUniqueInput, { nullable: true })
  @Type(() => CommentThreadWhereUniqueInput)
  connect?: CommentThreadWhereUniqueInput;

  @Field(() => CommentThreadUpdateWithoutCommentThreadTargetsInput, {
    nullable: true,
  })
  @Type(() => CommentThreadUpdateWithoutCommentThreadTargetsInput)
  update?: CommentThreadUpdateWithoutCommentThreadTargetsInput;
}
