import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { UserSettingsWhereInput } from './user-settings-where.input';
import { Type } from 'class-transformer';

@ArgsType()
export class DeleteManyUserSettingsArgs {

    @Field(() => UserSettingsWhereInput, {nullable:true})
    @Type(() => UserSettingsWhereInput)
    where?: UserSettingsWhereInput;
}
