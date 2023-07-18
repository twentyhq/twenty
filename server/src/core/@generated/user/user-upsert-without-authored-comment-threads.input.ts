import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutAuthoredCommentThreadsInput } from './user-update-without-authored-comment-threads.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateWithoutAuthoredCommentThreadsInput } from './user-create-without-authored-comment-threads.input';

@InputType()
export class UserUpsertWithoutAuthoredCommentThreadsInput {

    @HideField()
    update!: UserUpdateWithoutAuthoredCommentThreadsInput;

    @HideField()
    create!: UserCreateWithoutAuthoredCommentThreadsInput;
}
