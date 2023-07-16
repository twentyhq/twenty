import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutAuthoredCommentThreadsInput } from './user-create-without-authored-comment-threads.input';

@InputType()
export class UserCreateOrConnectWithoutAuthoredCommentThreadsInput {

    @Field(() => UserWhereUniqueInput, {nullable:false})
    @Type(() => UserWhereUniqueInput)
    where!: UserWhereUniqueInput;

    @Field(() => UserCreateWithoutAuthoredCommentThreadsInput, {nullable:false})
    @Type(() => UserCreateWithoutAuthoredCommentThreadsInput)
    create!: UserCreateWithoutAuthoredCommentThreadsInput;
}
