import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutAssignedCommentThreadsInput } from './user-create-without-assigned-comment-threads.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateOrConnectWithoutAssignedCommentThreadsInput } from './user-create-or-connect-without-assigned-comment-threads.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class UserCreateNestedOneWithoutAssignedCommentThreadsInput {

    @HideField()
    create?: UserCreateWithoutAssignedCommentThreadsInput;

    @HideField()
    connectOrCreate?: UserCreateOrConnectWithoutAssignedCommentThreadsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;
}
