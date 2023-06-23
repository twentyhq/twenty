import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutCommentThreadsInput } from './workspace-update-without-comment-threads.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutCommentThreadsInput } from './workspace-create-without-comment-threads.input';

@InputType()
export class WorkspaceUpsertWithoutCommentThreadsInput {

    @Field(() => WorkspaceUpdateWithoutCommentThreadsInput, {nullable:false})
    @Type(() => WorkspaceUpdateWithoutCommentThreadsInput)
    update!: WorkspaceUpdateWithoutCommentThreadsInput;

    @Field(() => WorkspaceCreateWithoutCommentThreadsInput, {nullable:false})
    @Type(() => WorkspaceCreateWithoutCommentThreadsInput)
    create!: WorkspaceCreateWithoutCommentThreadsInput;
}
