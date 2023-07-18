import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { UserSettingsCreateInput } from './user-settings-create.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateOneUserSettingsArgs {

    @Field(() => UserSettingsCreateInput, {nullable:false})
    @Type(() => UserSettingsCreateInput)
    @ValidateNested({each: true})
    @Type(() => UserSettingsCreateInput)
    data!: UserSettingsCreateInput;
}
