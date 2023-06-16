import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { NestedIntFilter } from './nested-int-filter.input';
import { NestedDateTimeFilter } from './nested-date-time-filter.input';

@InputType()
export class NestedDateTimeWithAggregatesFilter {

    @Field(() => Date, {nullable:true})
    equals?: Date | string;

    @Field(() => [Date], {nullable:true})
    in?: Array<Date> | Array<string>;

    @Field(() => [Date], {nullable:true})
    notIn?: Array<Date> | Array<string>;

    @Field(() => Date, {nullable:true})
    lt?: Date | string;

    @Field(() => Date, {nullable:true})
    lte?: Date | string;

    @Field(() => Date, {nullable:true})
    gt?: Date | string;

    @Field(() => Date, {nullable:true})
    gte?: Date | string;

    @Field(() => NestedDateTimeWithAggregatesFilter, {nullable:true})
    not?: NestedDateTimeWithAggregatesFilter;

    @Field(() => NestedIntFilter, {nullable:true})
    _count?: NestedIntFilter;

    @Field(() => NestedDateTimeFilter, {nullable:true})
    _min?: NestedDateTimeFilter;

    @Field(() => NestedDateTimeFilter, {nullable:true})
    _max?: NestedDateTimeFilter;
}
