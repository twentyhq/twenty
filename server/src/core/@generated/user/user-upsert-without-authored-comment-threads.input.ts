import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutAuthoredCommentThreadsInput } from './user-update-without-authored-comment-threads.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutAuthoredCommentThreadsInput } from './user-create-without-authored-comment-threads.input';

@InputType()
export class UserUpsertWithoutAuthoredCommentThreadsInput {

    @Field(() => UserUpdateWithoutAuthoredCommentThreadsInput, {nullable:false})
    @Type(() => UserUpdateWithoutAuthoredCommentThreadsInput)
    update!: UserUpdateWithoutAuthoredCommentThreadsInput;

    @Field(() => UserCreateWithoutAuthoredCommentThreadsInput, {nullable:false})
    @Type(() => UserCreateWithoutAuthoredCommentThreadsInput)
    create!: UserCreateWithoutAuthoredCommentThreadsInput;
}
