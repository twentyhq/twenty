import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadTargetCreateWithoutCommentThreadInput } from './comment-thread-target-create-without-comment-thread.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadTargetCreateOrConnectWithoutCommentThreadInput } from './comment-thread-target-create-or-connect-without-comment-thread.input';
import { CommentThreadTargetCreateManyCommentThreadInputEnvelope } from './comment-thread-target-create-many-comment-thread-input-envelope.input';
import { Type } from 'class-transformer';
import { CommentThreadTargetWhereUniqueInput } from './comment-thread-target-where-unique.input';

@InputType()
export class CommentThreadTargetCreateNestedManyWithoutCommentThreadInput {
  @HideField()
  create?: Array<CommentThreadTargetCreateWithoutCommentThreadInput>;

  @HideField()
  connectOrCreate?: Array<CommentThreadTargetCreateOrConnectWithoutCommentThreadInput>;

  @Field(() => CommentThreadTargetCreateManyCommentThreadInputEnvelope, {
    nullable: true,
  })
  @Type(() => CommentThreadTargetCreateManyCommentThreadInputEnvelope)
  createMany?: CommentThreadTargetCreateManyCommentThreadInputEnvelope;

  @HideField()
  connect?: Array<CommentThreadTargetWhereUniqueInput>;
}
