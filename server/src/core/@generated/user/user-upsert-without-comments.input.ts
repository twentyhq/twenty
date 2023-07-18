import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutCommentsInput } from './user-update-without-comments.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateWithoutCommentsInput } from './user-create-without-comments.input';

@InputType()
export class UserUpsertWithoutCommentsInput {

    @HideField()
    update!: UserUpdateWithoutCommentsInput;

    @HideField()
    create!: UserCreateWithoutCommentsInput;
}
