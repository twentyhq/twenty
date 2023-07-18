import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutSettingsInput } from './user-create-without-settings.input';

@InputType()
export class UserCreateOrConnectWithoutSettingsInput {

    @Field(() => UserWhereUniqueInput, {nullable:false})
    @Type(() => UserWhereUniqueInput)
    where!: UserWhereUniqueInput;

    @Field(() => UserCreateWithoutSettingsInput, {nullable:false})
    @Type(() => UserCreateWithoutSettingsInput)
    create!: UserCreateWithoutSettingsInput;
}
