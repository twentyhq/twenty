import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutCommentsInput } from './workspace-update-without-comments.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutCommentsInput } from './workspace-create-without-comments.input';

@InputType()
export class WorkspaceUpsertWithoutCommentsInput {
  @Field(() => WorkspaceUpdateWithoutCommentsInput, { nullable: false })
  @Type(() => WorkspaceUpdateWithoutCommentsInput)
  update!: WorkspaceUpdateWithoutCommentsInput;

  @Field(() => WorkspaceCreateWithoutCommentsInput, { nullable: false })
  @Type(() => WorkspaceCreateWithoutCommentsInput)
  create!: WorkspaceCreateWithoutCommentsInput;
}
