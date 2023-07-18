import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutCommentsInput } from './workspace-update-without-comments.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateWithoutCommentsInput } from './workspace-create-without-comments.input';

@InputType()
export class WorkspaceUpsertWithoutCommentsInput {

    @HideField()
    update!: WorkspaceUpdateWithoutCommentsInput;

    @HideField()
    create!: WorkspaceCreateWithoutCommentsInput;
}
