import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserSettingsCreateWithoutUserInput } from './user-settings-create-without-user.input';
import { Type } from 'class-transformer';
import { UserSettingsCreateOrConnectWithoutUserInput } from './user-settings-create-or-connect-without-user.input';
import { UserSettingsUpsertWithoutUserInput } from './user-settings-upsert-without-user.input';
import { UserSettingsWhereUniqueInput } from './user-settings-where-unique.input';
import { UserSettingsUpdateWithoutUserInput } from './user-settings-update-without-user.input';

@InputType()
export class UserSettingsUpdateOneRequiredWithoutUserNestedInput {

    @Field(() => UserSettingsCreateWithoutUserInput, {nullable:true})
    @Type(() => UserSettingsCreateWithoutUserInput)
    create?: UserSettingsCreateWithoutUserInput;

    @Field(() => UserSettingsCreateOrConnectWithoutUserInput, {nullable:true})
    @Type(() => UserSettingsCreateOrConnectWithoutUserInput)
    connectOrCreate?: UserSettingsCreateOrConnectWithoutUserInput;

    @Field(() => UserSettingsUpsertWithoutUserInput, {nullable:true})
    @Type(() => UserSettingsUpsertWithoutUserInput)
    upsert?: UserSettingsUpsertWithoutUserInput;

    @Field(() => UserSettingsWhereUniqueInput, {nullable:true})
    @Type(() => UserSettingsWhereUniqueInput)
    connect?: UserSettingsWhereUniqueInput;

    @Field(() => UserSettingsUpdateWithoutUserInput, {nullable:true})
    @Type(() => UserSettingsUpdateWithoutUserInput)
    update?: UserSettingsUpdateWithoutUserInput;
}
