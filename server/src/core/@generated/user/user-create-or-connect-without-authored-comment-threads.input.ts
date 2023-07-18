import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutAuthoredCommentThreadsInput } from './user-create-without-authored-comment-threads.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class UserCreateOrConnectWithoutAuthoredCommentThreadsInput {

    @Field(() => UserWhereUniqueInput, {nullable:false})
    @Type(() => UserWhereUniqueInput)
    where!: UserWhereUniqueInput;

    @HideField()
    create!: UserCreateWithoutAuthoredCommentThreadsInput;
}
