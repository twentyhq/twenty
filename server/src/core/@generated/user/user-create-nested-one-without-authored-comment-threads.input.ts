import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutAuthoredCommentThreadsInput } from './user-create-without-authored-comment-threads.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutAuthoredCommentThreadsInput } from './user-create-or-connect-without-authored-comment-threads.input';
import { UserWhereUniqueInput } from './user-where-unique.input';

@InputType()
export class UserCreateNestedOneWithoutAuthoredCommentThreadsInput {

    @Field(() => UserCreateWithoutAuthoredCommentThreadsInput, {nullable:true})
    @Type(() => UserCreateWithoutAuthoredCommentThreadsInput)
    create?: UserCreateWithoutAuthoredCommentThreadsInput;

    @Field(() => UserCreateOrConnectWithoutAuthoredCommentThreadsInput, {nullable:true})
    @Type(() => UserCreateOrConnectWithoutAuthoredCommentThreadsInput)
    connectOrCreate?: UserCreateOrConnectWithoutAuthoredCommentThreadsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;
}
