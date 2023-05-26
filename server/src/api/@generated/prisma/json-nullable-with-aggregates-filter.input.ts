import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { NestedIntNullableFilter } from './nested-int-nullable-filter.input';
import { NestedJsonNullableFilter } from './nested-json-nullable-filter.input';

@InputType()
export class JsonNullableWithAggregatesFilter {

    @Field(() => GraphQLJSON, {nullable:true})
    equals?: any;

    @Field(() => [String], {nullable:true})
    path?: Array<string>;

    @Field(() => String, {nullable:true})
    string_contains?: string;

    @Field(() => String, {nullable:true})
    string_starts_with?: string;

    @Field(() => String, {nullable:true})
    string_ends_with?: string;

    @Field(() => GraphQLJSON, {nullable:true})
    array_contains?: any;

    @Field(() => GraphQLJSON, {nullable:true})
    array_starts_with?: any;

    @Field(() => GraphQLJSON, {nullable:true})
    array_ends_with?: any;

    @Field(() => GraphQLJSON, {nullable:true})
    lt?: any;

    @Field(() => GraphQLJSON, {nullable:true})
    lte?: any;

    @Field(() => GraphQLJSON, {nullable:true})
    gt?: any;

    @Field(() => GraphQLJSON, {nullable:true})
    gte?: any;

    @Field(() => GraphQLJSON, {nullable:true})
    not?: any;

    @Field(() => NestedIntNullableFilter, {nullable:true})
    _count?: NestedIntNullableFilter;

    @Field(() => NestedJsonNullableFilter, {nullable:true})
    _min?: NestedJsonNullableFilter;

    @Field(() => NestedJsonNullableFilter, {nullable:true})
    _max?: NestedJsonNullableFilter;
}
