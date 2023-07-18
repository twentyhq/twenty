import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { ColorScheme } from '../prisma/color-scheme.enum';
import * as Validator from 'class-validator';
import { UserUncheckedCreateNestedOneWithoutSettingsInput } from '../user/user-unchecked-create-nested-one-without-settings.input';

@InputType()
export class UserSettingsUncheckedCreateInput {

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

    @Field(() => UserUncheckedCreateNestedOneWithoutSettingsInput, {nullable:true})
    user?: UserUncheckedCreateNestedOneWithoutSettingsInput;
}
