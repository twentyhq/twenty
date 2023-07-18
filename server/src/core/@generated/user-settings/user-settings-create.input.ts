import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { ColorScheme } from '../prisma/color-scheme.enum';
import * as Validator from 'class-validator';
import { UserCreateNestedOneWithoutSettingsInput } from '../user/user-create-nested-one-without-settings.input';

@InputType()
export class UserSettingsCreateInput {

    @Field(() => String, {nullable:true})
    id?: string;

    @Field(() => ColorScheme, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    colorScheme?: keyof typeof ColorScheme;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    locale!: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => UserCreateNestedOneWithoutSettingsInput, {nullable:true})
    user?: UserCreateNestedOneWithoutSettingsInput;
}
