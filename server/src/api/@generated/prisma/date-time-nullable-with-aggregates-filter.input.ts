import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { NestedDateTimeNullableWithAggregatesFilter } from './nested-date-time-nullable-with-aggregates-filter.input';
import { NestedIntNullableFilter } from './nested-int-nullable-filter.input';
import { NestedDateTimeNullableFilter } from './nested-date-time-nullable-filter.input';

@InputType()
export class DateTimeNullableWithAggregatesFilter {

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

    @Field(() => NestedDateTimeNullableWithAggregatesFilter, {nullable:true})
    not?: NestedDateTimeNullableWithAggregatesFilter;

    @Field(() => NestedIntNullableFilter, {nullable:true})
    _count?: NestedIntNullableFilter;

    @Field(() => NestedDateTimeNullableFilter, {nullable:true})
    _min?: NestedDateTimeNullableFilter;

    @Field(() => NestedDateTimeNullableFilter, {nullable:true})
    _max?: NestedDateTimeNullableFilter;
}
