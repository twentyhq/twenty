import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserSettingsWhereUniqueInput } from './user-settings-where-unique.input';
import { Type } from 'class-transformer';
import { UserSettingsCreateWithoutUserInput } from './user-settings-create-without-user.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class UserSettingsCreateOrConnectWithoutUserInput {

    @Field(() => UserSettingsWhereUniqueInput, {nullable:false})
    @Type(() => UserSettingsWhereUniqueInput)
    where!: UserSettingsWhereUniqueInput;

    @HideField()
    create!: UserSettingsCreateWithoutUserInput;
}
