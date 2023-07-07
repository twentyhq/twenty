import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutCommentThreadInput } from './user-update-without-comment-thread.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutCommentThreadInput } from './user-create-without-comment-thread.input';

@InputType()
export class UserUpsertWithoutCommentThreadInput {

    @Field(() => UserUpdateWithoutCommentThreadInput, {nullable:false})
    @Type(() => UserUpdateWithoutCommentThreadInput)
    update!: UserUpdateWithoutCommentThreadInput;

    @Field(() => UserCreateWithoutCommentThreadInput, {nullable:false})
    @Type(() => UserCreateWithoutCommentThreadInput)
    create!: UserCreateWithoutCommentThreadInput;
}
