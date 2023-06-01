import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';
import { CommentUpdateWithoutWorkspaceInput } from './comment-update-without-workspace.input';
import { CommentCreateWithoutWorkspaceInput } from './comment-create-without-workspace.input';

@InputType()
export class CommentUpsertWithWhereUniqueWithoutWorkspaceInput {
  @Field(() => CommentWhereUniqueInput, { nullable: false })
  @Type(() => CommentWhereUniqueInput)
  where!: CommentWhereUniqueInput;

  @Field(() => CommentUpdateWithoutWorkspaceInput, { nullable: false })
  @Type(() => CommentUpdateWithoutWorkspaceInput)
  update!: CommentUpdateWithoutWorkspaceInput;

  @Field(() => CommentCreateWithoutWorkspaceInput, { nullable: false })
  @Type(() => CommentCreateWithoutWorkspaceInput)
  create!: CommentCreateWithoutWorkspaceInput;
}
