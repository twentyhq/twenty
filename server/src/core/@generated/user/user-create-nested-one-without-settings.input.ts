import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutSettingsInput } from './user-create-without-settings.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutSettingsInput } from './user-create-or-connect-without-settings.input';
import { UserWhereUniqueInput } from './user-where-unique.input';

@InputType()
export class UserCreateNestedOneWithoutSettingsInput {

    @Field(() => UserCreateWithoutSettingsInput, {nullable:true})
    @Type(() => UserCreateWithoutSettingsInput)
    create?: UserCreateWithoutSettingsInput;

    @Field(() => UserCreateOrConnectWithoutSettingsInput, {nullable:true})
    @Type(() => UserCreateOrConnectWithoutSettingsInput)
    connectOrCreate?: UserCreateOrConnectWithoutSettingsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;
}
