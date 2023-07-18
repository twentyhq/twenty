import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutSettingsInput } from './user-create-without-settings.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateOrConnectWithoutSettingsInput } from './user-create-or-connect-without-settings.input';
import { UserUpsertWithoutSettingsInput } from './user-upsert-without-settings.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserUpdateWithoutSettingsInput } from './user-update-without-settings.input';

@InputType()
export class UserUpdateOneWithoutSettingsNestedInput {

    @HideField()
    create?: UserCreateWithoutSettingsInput;

    @HideField()
    connectOrCreate?: UserCreateOrConnectWithoutSettingsInput;

    @HideField()
    upsert?: UserUpsertWithoutSettingsInput;

    @Field(() => Boolean, {nullable:true})
    disconnect?: boolean;

    @HideField()
    delete?: boolean;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @HideField()
    update?: UserUpdateWithoutSettingsInput;
}
