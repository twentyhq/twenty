import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { UserSettingsWhereInput } from './user-settings-where.input';
import { Type } from 'class-transformer';
import { UserSettingsOrderByWithAggregationInput } from './user-settings-order-by-with-aggregation.input';
import { UserSettingsScalarFieldEnum } from './user-settings-scalar-field.enum';
import { UserSettingsScalarWhereWithAggregatesInput } from './user-settings-scalar-where-with-aggregates.input';
import { Int } from '@nestjs/graphql';
import { UserSettingsCountAggregateInput } from './user-settings-count-aggregate.input';
import { UserSettingsMinAggregateInput } from './user-settings-min-aggregate.input';
import { UserSettingsMaxAggregateInput } from './user-settings-max-aggregate.input';

@ArgsType()
export class UserSettingsGroupByArgs {

    @Field(() => UserSettingsWhereInput, {nullable:true})
    @Type(() => UserSettingsWhereInput)
    where?: UserSettingsWhereInput;

    @Field(() => [UserSettingsOrderByWithAggregationInput], {nullable:true})
    orderBy?: Array<UserSettingsOrderByWithAggregationInput>;

    @Field(() => [UserSettingsScalarFieldEnum], {nullable:false})
    by!: Array<keyof typeof UserSettingsScalarFieldEnum>;

    @Field(() => UserSettingsScalarWhereWithAggregatesInput, {nullable:true})
    having?: UserSettingsScalarWhereWithAggregatesInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => UserSettingsCountAggregateInput, {nullable:true})
    _count?: UserSettingsCountAggregateInput;

    @Field(() => UserSettingsMinAggregateInput, {nullable:true})
    _min?: UserSettingsMinAggregateInput;

    @Field(() => UserSettingsMaxAggregateInput, {nullable:true})
    _max?: UserSettingsMaxAggregateInput;
}
