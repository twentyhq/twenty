import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutAssignedCommentThreadsInput } from './user-update-without-assigned-comment-threads.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateWithoutAssignedCommentThreadsInput } from './user-create-without-assigned-comment-threads.input';

@InputType()
export class UserUpsertWithoutAssignedCommentThreadsInput {

    @HideField()
    update!: UserUpdateWithoutAssignedCommentThreadsInput;

    @HideField()
    create!: UserCreateWithoutAssignedCommentThreadsInput;
}
