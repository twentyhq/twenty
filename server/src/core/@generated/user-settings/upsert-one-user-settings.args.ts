import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { UserSettingsWhereUniqueInput } from './user-settings-where-unique.input';
import { Type } from 'class-transformer';
import { UserSettingsCreateInput } from './user-settings-create.input';
import { UserSettingsUpdateInput } from './user-settings-update.input';

@ArgsType()
export class UpsertOneUserSettingsArgs {

    @Field(() => UserSettingsWhereUniqueInput, {nullable:false})
    @Type(() => UserSettingsWhereUniqueInput)
    where!: UserSettingsWhereUniqueInput;

    @Field(() => UserSettingsCreateInput, {nullable:false})
    @Type(() => UserSettingsCreateInput)
    create!: UserSettingsCreateInput;

    @Field(() => UserSettingsUpdateInput, {nullable:false})
    @Type(() => UserSettingsUpdateInput)
    update!: UserSettingsUpdateInput;
}
