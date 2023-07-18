import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserSettingsUpdateWithoutUserInput } from './user-settings-update-without-user.input';
import { Type } from 'class-transformer';
import { UserSettingsCreateWithoutUserInput } from './user-settings-create-without-user.input';

@InputType()
export class UserSettingsUpsertWithoutUserInput {

    @Field(() => UserSettingsUpdateWithoutUserInput, {nullable:false})
    @Type(() => UserSettingsUpdateWithoutUserInput)
    update!: UserSettingsUpdateWithoutUserInput;

    @Field(() => UserSettingsCreateWithoutUserInput, {nullable:false})
    @Type(() => UserSettingsCreateWithoutUserInput)
    create!: UserSettingsCreateWithoutUserInput;
}
