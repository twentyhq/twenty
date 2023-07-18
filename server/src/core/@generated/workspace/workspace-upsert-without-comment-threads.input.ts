import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutCommentThreadsInput } from './workspace-update-without-comment-threads.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateWithoutCommentThreadsInput } from './workspace-create-without-comment-threads.input';

@InputType()
export class WorkspaceUpsertWithoutCommentThreadsInput {

    @HideField()
    update!: WorkspaceUpdateWithoutCommentThreadsInput;

    @HideField()
    create!: WorkspaceCreateWithoutCommentThreadsInput;
}
