import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserSettingsCreateWithoutUserInput } from './user-settings-create-without-user.input';
import { HideField } from '@nestjs/graphql';
import { UserSettingsCreateOrConnectWithoutUserInput } from './user-settings-create-or-connect-without-user.input';
import { UserSettingsUpsertWithoutUserInput } from './user-settings-upsert-without-user.input';
import { UserSettingsWhereUniqueInput } from './user-settings-where-unique.input';
import { Type } from 'class-transformer';
import { UserSettingsUpdateWithoutUserInput } from './user-settings-update-without-user.input';

@InputType()
export class UserSettingsUpdateOneRequiredWithoutUserNestedInput {

    @HideField()
    create?: UserSettingsCreateWithoutUserInput;

    @HideField()
    connectOrCreate?: UserSettingsCreateOrConnectWithoutUserInput;

    @HideField()
    upsert?: UserSettingsUpsertWithoutUserInput;

    @Field(() => UserSettingsWhereUniqueInput, {nullable:true})
    @Type(() => UserSettingsWhereUniqueInput)
    connect?: UserSettingsWhereUniqueInput;

    @HideField()
    update?: UserSettingsUpdateWithoutUserInput;
}
