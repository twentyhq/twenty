import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutAuthoredCommentThreadsInput } from './user-create-without-authored-comment-threads.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutAuthoredCommentThreadsInput } from './user-create-or-connect-without-authored-comment-threads.input';
import { UserUpsertWithoutAuthoredCommentThreadsInput } from './user-upsert-without-authored-comment-threads.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { UserUpdateWithoutAuthoredCommentThreadsInput } from './user-update-without-authored-comment-threads.input';

@InputType()
export class UserUpdateOneRequiredWithoutAuthoredCommentThreadsNestedInput {

    @Field(() => UserCreateWithoutAuthoredCommentThreadsInput, {nullable:true})
    @Type(() => UserCreateWithoutAuthoredCommentThreadsInput)
    create?: UserCreateWithoutAuthoredCommentThreadsInput;

    @Field(() => UserCreateOrConnectWithoutAuthoredCommentThreadsInput, {nullable:true})
    @Type(() => UserCreateOrConnectWithoutAuthoredCommentThreadsInput)
    connectOrCreate?: UserCreateOrConnectWithoutAuthoredCommentThreadsInput;

    @Field(() => UserUpsertWithoutAuthoredCommentThreadsInput, {nullable:true})
    @Type(() => UserUpsertWithoutAuthoredCommentThreadsInput)
    upsert?: UserUpsertWithoutAuthoredCommentThreadsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @Field(() => UserUpdateWithoutAuthoredCommentThreadsInput, {nullable:true})
    @Type(() => UserUpdateWithoutAuthoredCommentThreadsInput)
    update?: UserUpdateWithoutAuthoredCommentThreadsInput;
}
