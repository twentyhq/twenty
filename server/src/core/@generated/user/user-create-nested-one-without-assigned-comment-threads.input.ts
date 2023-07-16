import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutAssignedCommentThreadsInput } from './user-create-without-assigned-comment-threads.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutAssignedCommentThreadsInput } from './user-create-or-connect-without-assigned-comment-threads.input';
import { UserWhereUniqueInput } from './user-where-unique.input';

@InputType()
export class UserCreateNestedOneWithoutAssignedCommentThreadsInput {

    @Field(() => UserCreateWithoutAssignedCommentThreadsInput, {nullable:true})
    @Type(() => UserCreateWithoutAssignedCommentThreadsInput)
    create?: UserCreateWithoutAssignedCommentThreadsInput;

    @Field(() => UserCreateOrConnectWithoutAssignedCommentThreadsInput, {nullable:true})
    @Type(() => UserCreateOrConnectWithoutAssignedCommentThreadsInput)
    connectOrCreate?: UserCreateOrConnectWithoutAssignedCommentThreadsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;
}
