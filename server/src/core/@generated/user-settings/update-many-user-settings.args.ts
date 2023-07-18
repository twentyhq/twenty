import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { UserSettingsUpdateManyMutationInput } from './user-settings-update-many-mutation.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UserSettingsWhereInput } from './user-settings-where.input';

@ArgsType()
export class UpdateManyUserSettingsArgs {

    @Field(() => UserSettingsUpdateManyMutationInput, {nullable:false})
    @Type(() => UserSettingsUpdateManyMutationInput)
    @ValidateNested({each: true})
    @Type(() => UserSettingsUpdateManyMutationInput)
    data!: UserSettingsUpdateManyMutationInput;

    @Field(() => UserSettingsWhereInput, {nullable:true})
    @Type(() => UserSettingsWhereInput)
    where?: UserSettingsWhereInput;
}
