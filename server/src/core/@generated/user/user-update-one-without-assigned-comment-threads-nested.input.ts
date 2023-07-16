import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutAssignedCommentThreadsInput } from './user-create-without-assigned-comment-threads.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutAssignedCommentThreadsInput } from './user-create-or-connect-without-assigned-comment-threads.input';
import { UserUpsertWithoutAssignedCommentThreadsInput } from './user-upsert-without-assigned-comment-threads.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { UserUpdateWithoutAssignedCommentThreadsInput } from './user-update-without-assigned-comment-threads.input';

@InputType()
export class UserUpdateOneWithoutAssignedCommentThreadsNestedInput {

    @Field(() => UserCreateWithoutAssignedCommentThreadsInput, {nullable:true})
    @Type(() => UserCreateWithoutAssignedCommentThreadsInput)
    create?: UserCreateWithoutAssignedCommentThreadsInput;

    @Field(() => UserCreateOrConnectWithoutAssignedCommentThreadsInput, {nullable:true})
    @Type(() => UserCreateOrConnectWithoutAssignedCommentThreadsInput)
    connectOrCreate?: UserCreateOrConnectWithoutAssignedCommentThreadsInput;

    @Field(() => UserUpsertWithoutAssignedCommentThreadsInput, {nullable:true})
    @Type(() => UserUpsertWithoutAssignedCommentThreadsInput)
    upsert?: UserUpsertWithoutAssignedCommentThreadsInput;

    @Field(() => Boolean, {nullable:true})
    disconnect?: boolean;

    @Field(() => Boolean, {nullable:true})
    delete?: boolean;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @Field(() => UserUpdateWithoutAssignedCommentThreadsInput, {nullable:true})
    @Type(() => UserUpdateWithoutAssignedCommentThreadsInput)
    update?: UserUpdateWithoutAssignedCommentThreadsInput;
}
