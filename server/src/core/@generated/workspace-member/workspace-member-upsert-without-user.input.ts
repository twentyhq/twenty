import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberUpdateWithoutUserInput } from './workspace-member-update-without-user.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceMemberCreateWithoutUserInput } from './workspace-member-create-without-user.input';

@InputType()
export class WorkspaceMemberUpsertWithoutUserInput {

    @HideField()
    update!: WorkspaceMemberUpdateWithoutUserInput;

    @HideField()
    create!: WorkspaceMemberCreateWithoutUserInput;
}
