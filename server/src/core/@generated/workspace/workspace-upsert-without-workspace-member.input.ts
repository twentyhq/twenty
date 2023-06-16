import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutWorkspaceMemberInput } from './workspace-update-without-workspace-member.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutWorkspaceMemberInput } from './workspace-create-without-workspace-member.input';

@InputType()
export class WorkspaceUpsertWithoutWorkspaceMemberInput {
  @Field(() => WorkspaceUpdateWithoutWorkspaceMemberInput, { nullable: false })
  @Type(() => WorkspaceUpdateWithoutWorkspaceMemberInput)
  update!: WorkspaceUpdateWithoutWorkspaceMemberInput;

  @Field(() => WorkspaceCreateWithoutWorkspaceMemberInput, { nullable: false })
  @Type(() => WorkspaceCreateWithoutWorkspaceMemberInput)
  create!: WorkspaceCreateWithoutWorkspaceMemberInput;
}
