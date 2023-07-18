import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutWorkspaceMemberInput } from './user-update-without-workspace-member.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateWithoutWorkspaceMemberInput } from './user-create-without-workspace-member.input';

@InputType()
export class UserUpsertWithoutWorkspaceMemberInput {

    @HideField()
    update!: UserUpdateWithoutWorkspaceMemberInput;

    @HideField()
    create!: UserCreateWithoutWorkspaceMemberInput;
}
