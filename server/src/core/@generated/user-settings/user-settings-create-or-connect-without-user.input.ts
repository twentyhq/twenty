import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserSettingsWhereUniqueInput } from './user-settings-where-unique.input';
import { Type } from 'class-transformer';
import { UserSettingsCreateWithoutUserInput } from './user-settings-create-without-user.input';

@InputType()
export class UserSettingsCreateOrConnectWithoutUserInput {

    @Field(() => UserSettingsWhereUniqueInput, {nullable:false})
    @Type(() => UserSettingsWhereUniqueInput)
    where!: UserSettingsWhereUniqueInput;

    @Field(() => UserSettingsCreateWithoutUserInput, {nullable:false})
    @Type(() => UserSettingsCreateWithoutUserInput)
    create!: UserSettingsCreateWithoutUserInput;
}
