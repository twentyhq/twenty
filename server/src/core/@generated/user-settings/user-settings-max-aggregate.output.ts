import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ColorScheme } from '../prisma/color-scheme.enum';
import * as Validator from 'class-validator';

@ObjectType()
export class UserSettingsMaxAggregate {

    @Field(() => String, {nullable:true})
    id?: string;

    @Field(() => ColorScheme, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    colorScheme?: keyof typeof ColorScheme;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    locale?: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;
}
