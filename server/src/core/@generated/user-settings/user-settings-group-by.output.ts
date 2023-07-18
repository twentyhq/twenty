import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ColorScheme } from '../prisma/color-scheme.enum';
import * as Validator from 'class-validator';
import { UserSettingsCountAggregate } from './user-settings-count-aggregate.output';
import { UserSettingsMinAggregate } from './user-settings-min-aggregate.output';
import { UserSettingsMaxAggregate } from './user-settings-max-aggregate.output';

@ObjectType()
export class UserSettingsGroupBy {

    @Field(() => String, {nullable:false})
    id!: string;

    @Field(() => ColorScheme, {nullable:false})
    @Validator.IsString()
    @Validator.IsOptional()
    colorScheme!: keyof typeof ColorScheme;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    locale!: string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date | string;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date | string;

    @Field(() => UserSettingsCountAggregate, {nullable:true})
    _count?: UserSettingsCountAggregate;

    @Field(() => UserSettingsMinAggregate, {nullable:true})
    _min?: UserSettingsMinAggregate;

    @Field(() => UserSettingsMaxAggregate, {nullable:true})
    _max?: UserSettingsMaxAggregate;
}
