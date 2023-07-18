import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutSettingsInput } from './user-create-without-settings.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateOrConnectWithoutSettingsInput } from './user-create-or-connect-without-settings.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class UserUncheckedCreateNestedOneWithoutSettingsInput {

    @HideField()
    create?: UserCreateWithoutSettingsInput;

    @HideField()
    connectOrCreate?: UserCreateOrConnectWithoutSettingsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;
}
