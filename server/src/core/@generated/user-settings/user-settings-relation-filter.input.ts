import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserSettingsWhereInput } from './user-settings-where.input';

@InputType()
export class UserSettingsRelationFilter {

    @Field(() => UserSettingsWhereInput, {nullable:true})
    is?: UserSettingsWhereInput;

    @Field(() => UserSettingsWhereInput, {nullable:true})
    isNot?: UserSettingsWhereInput;
}
