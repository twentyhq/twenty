import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserSettingsCreateWithoutUserInput } from './user-settings-create-without-user.input';
import { HideField } from '@nestjs/graphql';
import { UserSettingsCreateOrConnectWithoutUserInput } from './user-settings-create-or-connect-without-user.input';
import { UserSettingsWhereUniqueInput } from './user-settings-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class UserSettingsCreateNestedOneWithoutUserInput {

    @HideField()
    create?: UserSettingsCreateWithoutUserInput;

    @HideField()
    connectOrCreate?: UserSettingsCreateOrConnectWithoutUserInput;

    @Field(() => UserSettingsWhereUniqueInput, {nullable:true})
    @Type(() => UserSettingsWhereUniqueInput)
    connect?: UserSettingsWhereUniqueInput;
}
