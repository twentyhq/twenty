import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { QueryMode } from './query-mode.enum';
import { NestedStringNullableFilter } from './nested-string-nullable-filter.input';

@InputType()
export class StringNullableFilter {

    @Field(() => String, {nullable:true})
    equals?: string;

    @Field(() => [String], {nullable:true})
    in?: Array<string>;

    @Field(() => [String], {nullable:true})
    notIn?: Array<string>;

    @Field(() => String, {nullable:true})
    lt?: string;

    @Field(() => String, {nullable:true})
    lte?: string;

    @Field(() => String, {nullable:true})
    gt?: string;

    @Field(() => String, {nullable:true})
    gte?: string;

    @Field(() => String, {nullable:true})
    contains?: string;

    @Field(() => String, {nullable:true})
    startsWith?: string;

    @Field(() => String, {nullable:true})
    endsWith?: string;

    @Field(() => QueryMode, {nullable:true})
    mode?: keyof typeof QueryMode;

    @Field(() => NestedStringNullableFilter, {nullable:true})
    not?: NestedStringNullableFilter;
}
