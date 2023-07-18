import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutWorkspaceMemberInput } from './workspace-update-without-workspace-member.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateWithoutWorkspaceMemberInput } from './workspace-create-without-workspace-member.input';

@InputType()
export class WorkspaceUpsertWithoutWorkspaceMemberInput {

    @HideField()
    update!: WorkspaceUpdateWithoutWorkspaceMemberInput;

    @HideField()
    create!: WorkspaceCreateWithoutWorkspaceMemberInput;
}
