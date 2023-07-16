import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { ActivityType } from './activity-type.enum';
import { NestedEnumActivityTypeWithAggregatesFilter } from './nested-enum-activity-type-with-aggregates-filter.input';
import { NestedIntFilter } from './nested-int-filter.input';
import { NestedEnumActivityTypeFilter } from './nested-enum-activity-type-filter.input';

@InputType()
export class EnumActivityTypeWithAggregatesFilter {

    @Field(() => ActivityType, {nullable:true})
    equals?: keyof typeof ActivityType;

    @Field(() => [ActivityType], {nullable:true})
    in?: Array<keyof typeof ActivityType>;

    @Field(() => [ActivityType], {nullable:true})
    notIn?: Array<keyof typeof ActivityType>;

    @Field(() => NestedEnumActivityTypeWithAggregatesFilter, {nullable:true})
    not?: NestedEnumActivityTypeWithAggregatesFilter;

    @Field(() => NestedIntFilter, {nullable:true})
    _count?: NestedIntFilter;

    @Field(() => NestedEnumActivityTypeFilter, {nullable:true})
    _min?: NestedEnumActivityTypeFilter;

    @Field(() => NestedEnumActivityTypeFilter, {nullable:true})
    _max?: NestedEnumActivityTypeFilter;
}
