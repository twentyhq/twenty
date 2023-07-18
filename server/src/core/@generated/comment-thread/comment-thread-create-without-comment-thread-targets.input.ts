import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { ActivityType } from '../prisma/activity-type.enum';
import { HideField } from '@nestjs/graphql';
import { CommentCreateNestedManyWithoutCommentThreadInput } from '../comment/comment-create-nested-many-without-comment-thread.input';
import { WorkspaceCreateNestedOneWithoutCommentThreadsInput } from '../workspace/workspace-create-nested-one-without-comment-threads.input';
import { UserCreateNestedOneWithoutAuthoredCommentThreadsInput } from '../user/user-create-nested-one-without-authored-comment-threads.input';
import { UserCreateNestedOneWithoutAssignedCommentThreadsInput } from '../user/user-create-nested-one-without-assigned-comment-threads.input';
import { AttachmentCreateNestedManyWithoutActivityInput } from '../attachment/attachment-create-nested-many-without-activity.input';

@InputType()
export class CommentThreadCreateWithoutCommentThreadTargetsInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:true})
    body?: string;

    @Field(() => String, {nullable:true})
    title?: string;

    @Field(() => ActivityType, {nullable:true})
    type?: keyof typeof ActivityType;

    @Field(() => Date, {nullable:true})
    reminderAt?: Date | string;

    @Field(() => Date, {nullable:true})
    dueAt?: Date | string;

    @Field(() => Date, {nullable:true})
    completedAt?: Date | string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => CommentCreateNestedManyWithoutCommentThreadInput, {nullable:true})
    comments?: CommentCreateNestedManyWithoutCommentThreadInput;

    @HideField()
    workspace!: WorkspaceCreateNestedOneWithoutCommentThreadsInput;

    @Field(() => UserCreateNestedOneWithoutAuthoredCommentThreadsInput, {nullable:false})
    author!: UserCreateNestedOneWithoutAuthoredCommentThreadsInput;

    @Field(() => UserCreateNestedOneWithoutAssignedCommentThreadsInput, {nullable:true})
    assignee?: UserCreateNestedOneWithoutAssignedCommentThreadsInput;

    @Field(() => AttachmentCreateNestedManyWithoutActivityInput, {nullable:true})
    attachments?: AttachmentCreateNestedManyWithoutActivityInput;
}
