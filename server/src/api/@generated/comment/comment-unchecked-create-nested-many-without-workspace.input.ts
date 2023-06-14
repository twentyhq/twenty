import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateWithoutWorkspaceInput } from './comment-create-without-workspace.input';
import { Type } from 'class-transformer';
import { CommentCreateOrConnectWithoutWorkspaceInput } from './comment-create-or-connect-without-workspace.input';
import { CommentCreateManyWorkspaceInputEnvelope } from './comment-create-many-workspace-input-envelope.input';
import { CommentWhereUniqueInput } from './comment-where-unique.input';

@InputType()
export class CommentUncheckedCreateNestedManyWithoutWorkspaceInput {
  @Field(() => [CommentCreateWithoutWorkspaceInput], { nullable: true })
  @Type(() => CommentCreateWithoutWorkspaceInput)
  create?: Array<CommentCreateWithoutWorkspaceInput>;

  @Field(() => [CommentCreateOrConnectWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => CommentCreateOrConnectWithoutWorkspaceInput)
  connectOrCreate?: Array<CommentCreateOrConnectWithoutWorkspaceInput>;

  @Field(() => CommentCreateManyWorkspaceInputEnvelope, { nullable: true })
  @Type(() => CommentCreateManyWorkspaceInputEnvelope)
  createMany?: CommentCreateManyWorkspaceInputEnvelope;

  @Field(() => [CommentWhereUniqueInput], { nullable: true })
  @Type(() => CommentWhereUniqueInput)
  connect?: Array<CommentWhereUniqueInput>;
}
