import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutCommentThreadInput } from './user-create-without-comment-thread.input';

@InputType()
export class UserCreateOrConnectWithoutCommentThreadInput {

    @Field(() => UserWhereUniqueInput, {nullable:false})
    @Type(() => UserWhereUniqueInput)
    where!: UserWhereUniqueInput;

    @Field(() => UserCreateWithoutCommentThreadInput, {nullable:false})
    @Type(() => UserCreateWithoutCommentThreadInput)
    create!: UserCreateWithoutCommentThreadInput;
}
