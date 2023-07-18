import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutAssignedCommentThreadsInput } from './user-create-without-assigned-comment-threads.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateOrConnectWithoutAssignedCommentThreadsInput } from './user-create-or-connect-without-assigned-comment-threads.input';
import { UserUpsertWithoutAssignedCommentThreadsInput } from './user-upsert-without-assigned-comment-threads.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserUpdateWithoutAssignedCommentThreadsInput } from './user-update-without-assigned-comment-threads.input';

@InputType()
export class UserUpdateOneWithoutAssignedCommentThreadsNestedInput {

    @HideField()
    create?: UserCreateWithoutAssignedCommentThreadsInput;

    @HideField()
    connectOrCreate?: UserCreateOrConnectWithoutAssignedCommentThreadsInput;

    @HideField()
    upsert?: UserUpsertWithoutAssignedCommentThreadsInput;

    @Field(() => Boolean, {nullable:true})
    disconnect?: boolean;

    @HideField()
    delete?: boolean;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @HideField()
    update?: UserUpdateWithoutAssignedCommentThreadsInput;
}
