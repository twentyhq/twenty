import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutSettingsInput } from './user-create-without-settings.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutSettingsInput } from './user-create-or-connect-without-settings.input';
import { UserUpsertWithoutSettingsInput } from './user-upsert-without-settings.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { UserUpdateWithoutSettingsInput } from './user-update-without-settings.input';

@InputType()
export class UserUpdateOneWithoutSettingsNestedInput {

    @Field(() => UserCreateWithoutSettingsInput, {nullable:true})
    @Type(() => UserCreateWithoutSettingsInput)
    create?: UserCreateWithoutSettingsInput;

    @Field(() => UserCreateOrConnectWithoutSettingsInput, {nullable:true})
    @Type(() => UserCreateOrConnectWithoutSettingsInput)
    connectOrCreate?: UserCreateOrConnectWithoutSettingsInput;

    @Field(() => UserUpsertWithoutSettingsInput, {nullable:true})
    @Type(() => UserUpsertWithoutSettingsInput)
    upsert?: UserUpsertWithoutSettingsInput;

    @Field(() => Boolean, {nullable:true})
    disconnect?: boolean;

    @Field(() => Boolean, {nullable:true})
    delete?: boolean;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @Field(() => UserUpdateWithoutSettingsInput, {nullable:true})
    @Type(() => UserUpdateWithoutSettingsInput)
    update?: UserUpdateWithoutSettingsInput;
}
