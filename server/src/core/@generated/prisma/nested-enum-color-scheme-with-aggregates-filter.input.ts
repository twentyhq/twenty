import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { ColorScheme } from './color-scheme.enum';
import { NestedIntFilter } from './nested-int-filter.input';
import { NestedEnumColorSchemeFilter } from './nested-enum-color-scheme-filter.input';

@InputType()
export class NestedEnumColorSchemeWithAggregatesFilter {

    @Field(() => ColorScheme, {nullable:true})
    equals?: keyof typeof ColorScheme;

    @Field(() => [ColorScheme], {nullable:true})
    in?: Array<keyof typeof ColorScheme>;

    @Field(() => [ColorScheme], {nullable:true})
    notIn?: Array<keyof typeof ColorScheme>;

    @Field(() => NestedEnumColorSchemeWithAggregatesFilter, {nullable:true})
    not?: NestedEnumColorSchemeWithAggregatesFilter;

    @Field(() => NestedIntFilter, {nullable:true})
    _count?: NestedIntFilter;

    @Field(() => NestedEnumColorSchemeFilter, {nullable:true})
    _min?: NestedEnumColorSchemeFilter;

    @Field(() => NestedEnumColorSchemeFilter, {nullable:true})
    _max?: NestedEnumColorSchemeFilter;
}
