import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateWithoutAuthorInput } from './comment-create-without-author.input';
import { Type } from 'class-transformer';
import { CommentCreateOrConnectWithoutAuthorInput } from './comment-create-or-connect-without-author.input';
import { CommentUpsertWithWhereUniqueWithoutAuthorInput } from './comment-upsert-with-where-unique-without-author.input';
import { CommentCreateManyAuthorInputEnvelope } from './comment-create-many-author-input-envelope.input';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { CommentUpdateWithWhereUniqueWithoutAuthorInput } from './comment-update-with-where-unique-without-author.input';
import { CommentUpdateManyWithWhereWithoutAuthorInput } from './comment-update-many-with-where-without-author.input';
import { CommentScalarWhereInput } from './comment-scalar-where.input';

@InputType()
export class CommentUncheckedUpdateManyWithoutAuthorNestedInput {
  @Field(() => [CommentCreateWithoutAuthorInput], { nullable: true })
  @Type(() => CommentCreateWithoutAuthorInput)
  create?: Array<CommentCreateWithoutAuthorInput>;

  @Field(() => [CommentCreateOrConnectWithoutAuthorInput], { nullable: true })
  @Type(() => CommentCreateOrConnectWithoutAuthorInput)
  connectOrCreate?: Array<CommentCreateOrConnectWithoutAuthorInput>;

  @Field(() => [CommentUpsertWithWhereUniqueWithoutAuthorInput], {
    nullable: true,
  })
  @Type(() => CommentUpsertWithWhereUniqueWithoutAuthorInput)
  upsert?: Array<CommentUpsertWithWhereUniqueWithoutAuthorInput>;

  @Field(() => CommentCreateManyAuthorInputEnvelope, { nullable: true })
  @Type(() => CommentCreateManyAuthorInputEnvelope)
  createMany?: CommentCreateManyAuthorInputEnvelope;

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

  @Field(() => [CommentUpdateWithWhereUniqueWithoutAuthorInput], {
    nullable: true,
  })
  @Type(() => CommentUpdateWithWhereUniqueWithoutAuthorInput)
  update?: Array<CommentUpdateWithWhereUniqueWithoutAuthorInput>;

  @Field(() => [CommentUpdateManyWithWhereWithoutAuthorInput], {
    nullable: true,
  })
  @Type(() => CommentUpdateManyWithWhereWithoutAuthorInput)
  updateMany?: Array<CommentUpdateManyWithWhereWithoutAuthorInput>;

  @Field(() => [CommentScalarWhereInput], { nullable: true })
  @Type(() => CommentScalarWhereInput)
  deleteMany?: Array<CommentScalarWhereInput>;
}
