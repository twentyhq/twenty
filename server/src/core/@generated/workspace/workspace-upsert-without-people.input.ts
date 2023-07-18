import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutPeopleInput } from './workspace-update-without-people.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPeopleInput } from './workspace-create-without-people.input';

@InputType()
export class WorkspaceUpsertWithoutPeopleInput {

    @HideField()
    update!: WorkspaceUpdateWithoutPeopleInput;

    @HideField()
    create!: WorkspaceCreateWithoutPeopleInput;
}
