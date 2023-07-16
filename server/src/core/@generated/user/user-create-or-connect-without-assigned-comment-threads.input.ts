import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutAssignedCommentThreadsInput } from './user-create-without-assigned-comment-threads.input';

@InputType()
export class UserCreateOrConnectWithoutAssignedCommentThreadsInput {

    @Field(() => UserWhereUniqueInput, {nullable:false})
    @Type(() => UserWhereUniqueInput)
    where!: UserWhereUniqueInput;

    @Field(() => UserCreateWithoutAssignedCommentThreadsInput, {nullable:false})
    @Type(() => UserCreateWithoutAssignedCommentThreadsInput)
    create!: UserCreateWithoutAssignedCommentThreadsInput;
}
