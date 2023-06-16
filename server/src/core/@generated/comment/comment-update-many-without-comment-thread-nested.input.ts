import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateWithoutCommentThreadInput } from './comment-create-without-comment-thread.input';
import { Type } from 'class-transformer';
import { CommentCreateOrConnectWithoutCommentThreadInput } from './comment-create-or-connect-without-comment-thread.input';
import { CommentUpsertWithWhereUniqueWithoutCommentThreadInput } from './comment-upsert-with-where-unique-without-comment-thread.input';
import { CommentCreateManyCommentThreadInputEnvelope } from './comment-create-many-comment-thread-input-envelope.input';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { CommentUpdateWithWhereUniqueWithoutCommentThreadInput } from './comment-update-with-where-unique-without-comment-thread.input';
import { CommentUpdateManyWithWhereWithoutCommentThreadInput } from './comment-update-many-with-where-without-comment-thread.input';
import { CommentScalarWhereInput } from './comment-scalar-where.input';

@InputType()
export class CommentUpdateManyWithoutCommentThreadNestedInput {
  @Field(() => [CommentCreateWithoutCommentThreadInput], { nullable: true })
  @Type(() => CommentCreateWithoutCommentThreadInput)
  create?: Array<CommentCreateWithoutCommentThreadInput>;

  @Field(() => [CommentCreateOrConnectWithoutCommentThreadInput], {
    nullable: true,
  })
  @Type(() => CommentCreateOrConnectWithoutCommentThreadInput)
  connectOrCreate?: Array<CommentCreateOrConnectWithoutCommentThreadInput>;

  @Field(() => [CommentUpsertWithWhereUniqueWithoutCommentThreadInput], {
    nullable: true,
  })
  @Type(() => CommentUpsertWithWhereUniqueWithoutCommentThreadInput)
  upsert?: Array<CommentUpsertWithWhereUniqueWithoutCommentThreadInput>;

  @Field(() => CommentCreateManyCommentThreadInputEnvelope, { nullable: true })
  @Type(() => CommentCreateManyCommentThreadInputEnvelope)
  createMany?: CommentCreateManyCommentThreadInputEnvelope;

  @Field(() => [CommentWhereUniqueInput], { nullable: true })
  @Type(() => CommentWhereUniqueInput)
  set?: Array<CommentWhereUniqueInput>;

  @Field(() => [CommentWhereUniqueInput], { nullable: true })
  @Type(() => CommentWhereUniqueInput)
  disconnect?: Array<CommentWhereUniqueInput>;

  @Field(() => [CommentWhereUniqueInput], { nullable: true })
  @Type(() => CommentWhereUniqueInput)
  delete?: Array<CommentWhereUniqueInput>;

  @Field(() => [CommentWhereUniqueInput], { nullable: true })
  @Type(() => CommentWhereUniqueInput)
  connect?: Array<CommentWhereUniqueInput>;

  @Field(() => [CommentUpdateWithWhereUniqueWithoutCommentThreadInput], {
    nullable: true,
  })
  @Type(() => CommentUpdateWithWhereUniqueWithoutCommentThreadInput)
  update?: Array<CommentUpdateWithWhereUniqueWithoutCommentThreadInput>;

  @Field(() => [CommentUpdateManyWithWhereWithoutCommentThreadInput], {
    nullable: true,
  })
  @Type(() => CommentUpdateManyWithWhereWithoutCommentThreadInput)
  updateMany?: Array<CommentUpdateManyWithWhereWithoutCommentThreadInput>;

  @Field(() => [CommentScalarWhereInput], { nullable: true })
  @Type(() => CommentScalarWhereInput)
  deleteMany?: Array<CommentScalarWhereInput>;
}
