import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { NestedIntNullableFilter } from './nested-int-nullable-filter.input';
import { NestedFloatNullableFilter } from './nested-float-nullable-filter.input';

@InputType()
export class NestedIntNullableWithAggregatesFilter {

    @Field(() => Int, {nullable:true})
    equals?: number;

    @Field(() => [Int], {nullable:true})
    in?: Array<number>;

    @Field(() => [Int], {nullable:true})
    notIn?: Array<number>;

    @Field(() => Int, {nullable:true})
    lt?: number;

    @Field(() => Int, {nullable:true})
    lte?: number;

    @Field(() => Int, {nullable:true})
    gt?: number;

    @Field(() => Int, {nullable:true})
    gte?: number;

    @Field(() => NestedIntNullableWithAggregatesFilter, {nullable:true})
    not?: NestedIntNullableWithAggregatesFilter;

    @Field(() => NestedIntNullableFilter, {nullable:true})
    _count?: NestedIntNullableFilter;

    @Field(() => NestedFloatNullableFilter, {nullable:true})
    _avg?: NestedFloatNullableFilter;

    @Field(() => NestedIntNullableFilter, {nullable:true})
    _sum?: NestedIntNullableFilter;

    @Field(() => NestedIntNullableFilter, {nullable:true})
    _min?: NestedIntNullableFilter;

    @Field(() => NestedIntNullableFilter, {nullable:true})
    _max?: NestedIntNullableFilter;
}
