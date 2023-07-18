import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { UserSettingsWhereInput } from '../user-settings/user-settings-where.input';
import { Type } from 'class-transformer';
import { UserSettingsOrderByWithRelationInput } from '../user-settings/user-settings-order-by-with-relation.input';
import { UserSettingsWhereUniqueInput } from '../user-settings/user-settings-where-unique.input';
import { Int } from '@nestjs/graphql';
import { UserSettingsCountAggregateInput } from '../user-settings/user-settings-count-aggregate.input';
import { UserSettingsMinAggregateInput } from '../user-settings/user-settings-min-aggregate.input';
import { UserSettingsMaxAggregateInput } from '../user-settings/user-settings-max-aggregate.input';

@ArgsType()
export class UserSettingsAggregateArgs {

    @Field(() => UserSettingsWhereInput, {nullable:true})
    @Type(() => UserSettingsWhereInput)
    where?: UserSettingsWhereInput;

    @Field(() => [UserSettingsOrderByWithRelationInput], {nullable:true})
    orderBy?: Array<UserSettingsOrderByWithRelationInput>;

    @Field(() => UserSettingsWhereUniqueInput, {nullable:true})
    cursor?: UserSettingsWhereUniqueInput;

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
