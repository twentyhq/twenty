import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateWithoutWorkspaceInput } from './comment-create-without-workspace.input';
import { Type } from 'class-transformer';
import { CommentCreateOrConnectWithoutWorkspaceInput } from './comment-create-or-connect-without-workspace.input';
import { CommentUpsertWithWhereUniqueWithoutWorkspaceInput } from './comment-upsert-with-where-unique-without-workspace.input';
import { CommentCreateManyWorkspaceInputEnvelope } from './comment-create-many-workspace-input-envelope.input';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { CommentUpdateWithWhereUniqueWithoutWorkspaceInput } from './comment-update-with-where-unique-without-workspace.input';
import { CommentUpdateManyWithWhereWithoutWorkspaceInput } from './comment-update-many-with-where-without-workspace.input';
import { CommentScalarWhereInput } from './comment-scalar-where.input';

@InputType()
export class CommentUncheckedUpdateManyWithoutWorkspaceNestedInput {
  @Field(() => [CommentCreateWithoutWorkspaceInput], { nullable: true })
  @Type(() => CommentCreateWithoutWorkspaceInput)
  create?: Array<CommentCreateWithoutWorkspaceInput>;

  @Field(() => [CommentCreateOrConnectWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => CommentCreateOrConnectWithoutWorkspaceInput)
  connectOrCreate?: Array<CommentCreateOrConnectWithoutWorkspaceInput>;

  @Field(() => [CommentUpsertWithWhereUniqueWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => CommentUpsertWithWhereUniqueWithoutWorkspaceInput)
  upsert?: Array<CommentUpsertWithWhereUniqueWithoutWorkspaceInput>;

  @Field(() => CommentCreateManyWorkspaceInputEnvelope, { nullable: true })
  @Type(() => CommentCreateManyWorkspaceInputEnvelope)
  createMany?: CommentCreateManyWorkspaceInputEnvelope;

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

  @Field(() => [CommentUpdateWithWhereUniqueWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => CommentUpdateWithWhereUniqueWithoutWorkspaceInput)
  update?: Array<CommentUpdateWithWhereUniqueWithoutWorkspaceInput>;

  @Field(() => [CommentUpdateManyWithWhereWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => CommentUpdateManyWithWhereWithoutWorkspaceInput)
  updateMany?: Array<CommentUpdateManyWithWhereWithoutWorkspaceInput>;

  @Field(() => [CommentScalarWhereInput], { nullable: true })
  @Type(() => CommentScalarWhereInput)
  deleteMany?: Array<CommentScalarWhereInput>;
}
