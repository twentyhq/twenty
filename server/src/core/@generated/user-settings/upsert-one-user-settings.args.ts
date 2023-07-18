import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { UserSettingsWhereUniqueInput } from './user-settings-where-unique.input';
import { Type } from 'class-transformer';
import { UserSettingsCreateInput } from './user-settings-create.input';
import { HideField } from '@nestjs/graphql';
import { UserSettingsUpdateInput } from './user-settings-update.input';

@ArgsType()
export class UpsertOneUserSettingsArgs {

    @Field(() => UserSettingsWhereUniqueInput, {nullable:false})
    @Type(() => UserSettingsWhereUniqueInput)
    where!: UserSettingsWhereUniqueInput;

    @HideField()
    create!: UserSettingsCreateInput;

    @HideField()
    update!: UserSettingsUpdateInput;
}
