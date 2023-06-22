import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { NestedDateTimeFilter } from './nested-date-time-filter.input';

@InputType()
export class DateTimeFilter {

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

    @Field(() => NestedDateTimeFilter, {nullable:true})
    not?: NestedDateTimeFilter;
}
