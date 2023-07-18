import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutSettingsInput } from './user-update-without-settings.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutSettingsInput } from './user-create-without-settings.input';

@InputType()
export class UserUpsertWithoutSettingsInput {

    @Field(() => UserUpdateWithoutSettingsInput, {nullable:false})
    @Type(() => UserUpdateWithoutSettingsInput)
    update!: UserUpdateWithoutSettingsInput;

    @Field(() => UserCreateWithoutSettingsInput, {nullable:false})
    @Type(() => UserCreateWithoutSettingsInput)
    create!: UserCreateWithoutSettingsInput;
}
