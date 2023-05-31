import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';
import { CommentCreateWithoutWorkspaceInput } from './comment-create-without-workspace.input';

@InputType()
export class CommentCreateOrConnectWithoutWorkspaceInput {
  @Field(() => CommentWhereUniqueInput, { nullable: false })
  @Type(() => CommentWhereUniqueInput)
  where!: CommentWhereUniqueInput;

  @Field(() => CommentCreateWithoutWorkspaceInput, { nullable: false })
  @Type(() => CommentCreateWithoutWorkspaceInput)
  create!: CommentCreateWithoutWorkspaceInput;
}
