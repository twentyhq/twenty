import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserSettingsUpdateWithoutUserInput } from './user-settings-update-without-user.input';
import { HideField } from '@nestjs/graphql';
import { UserSettingsCreateWithoutUserInput } from './user-settings-create-without-user.input';

@InputType()
export class UserSettingsUpsertWithoutUserInput {

    @HideField()
    update!: UserSettingsUpdateWithoutUserInput;

    @HideField()
    create!: UserSettingsCreateWithoutUserInput;
}
