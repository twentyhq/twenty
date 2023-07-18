import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserSettingsCreateWithoutUserInput } from './user-settings-create-without-user.input';
import { Type } from 'class-transformer';
import { UserSettingsCreateOrConnectWithoutUserInput } from './user-settings-create-or-connect-without-user.input';
import { UserSettingsWhereUniqueInput } from './user-settings-where-unique.input';

@InputType()
export class UserSettingsCreateNestedOneWithoutUserInput {

    @Field(() => UserSettingsCreateWithoutUserInput, {nullable:true})
    @Type(() => UserSettingsCreateWithoutUserInput)
    create?: UserSettingsCreateWithoutUserInput;

    @Field(() => UserSettingsCreateOrConnectWithoutUserInput, {nullable:true})
    @Type(() => UserSettingsCreateOrConnectWithoutUserInput)
    connectOrCreate?: UserSettingsCreateOrConnectWithoutUserInput;

    @Field(() => UserSettingsWhereUniqueInput, {nullable:true})
    @Type(() => UserSettingsWhereUniqueInput)
    connect?: UserSettingsWhereUniqueInput;
}
