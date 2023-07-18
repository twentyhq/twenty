import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutSettingsInput } from './user-update-without-settings.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateWithoutSettingsInput } from './user-create-without-settings.input';

@InputType()
export class UserUpsertWithoutSettingsInput {

    @HideField()
    update!: UserUpdateWithoutSettingsInput;

    @HideField()
    create!: UserCreateWithoutSettingsInput;
}
