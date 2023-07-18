import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutAuthoredCommentThreadsInput } from './user-create-without-authored-comment-threads.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateOrConnectWithoutAuthoredCommentThreadsInput } from './user-create-or-connect-without-authored-comment-threads.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class UserCreateNestedOneWithoutAuthoredCommentThreadsInput {

    @HideField()
    create?: UserCreateWithoutAuthoredCommentThreadsInput;

    @HideField()
    connectOrCreate?: UserCreateOrConnectWithoutAuthoredCommentThreadsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;
}
