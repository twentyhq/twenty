import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { UserSettingsWhereUniqueInput } from './user-settings-where-unique.input';
import { Type } from 'class-transformer';

@ArgsType()
export class DeleteOneUserSettingsArgs {

    @Field(() => UserSettingsWhereUniqueInput, {nullable:false})
    @Type(() => UserSettingsWhereUniqueInput)
    where!: UserSettingsWhereUniqueInput;
}
