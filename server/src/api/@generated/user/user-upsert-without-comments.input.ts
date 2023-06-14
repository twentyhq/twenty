import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutCommentsInput } from './user-update-without-comments.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutCommentsInput } from './user-create-without-comments.input';

@InputType()
export class UserUpsertWithoutCommentsInput {

    @Field(() => UserUpdateWithoutCommentsInput, {nullable:false})
    @Type(() => UserUpdateWithoutCommentsInput)
    update!: UserUpdateWithoutCommentsInput;

    @Field(() => UserCreateWithoutCommentsInput, {nullable:false})
    @Type(() => UserCreateWithoutCommentsInput)
    create!: UserCreateWithoutCommentsInput;
}
