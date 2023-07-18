import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutRefreshTokensInput } from './user-update-without-refresh-tokens.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateWithoutRefreshTokensInput } from './user-create-without-refresh-tokens.input';

@InputType()
export class UserUpsertWithoutRefreshTokensInput {

    @HideField()
    update!: UserUpdateWithoutRefreshTokensInput;

    @HideField()
    create!: UserCreateWithoutRefreshTokensInput;
}
