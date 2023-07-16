import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutAssignedCommentThreadsInput } from './user-update-without-assigned-comment-threads.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutAssignedCommentThreadsInput } from './user-create-without-assigned-comment-threads.input';

@InputType()
export class UserUpsertWithoutAssignedCommentThreadsInput {

    @Field(() => UserUpdateWithoutAssignedCommentThreadsInput, {nullable:false})
    @Type(() => UserUpdateWithoutAssignedCommentThreadsInput)
    update!: UserUpdateWithoutAssignedCommentThreadsInput;

    @Field(() => UserCreateWithoutAssignedCommentThreadsInput, {nullable:false})
    @Type(() => UserCreateWithoutAssignedCommentThreadsInput)
    create!: UserCreateWithoutAssignedCommentThreadsInput;
}
