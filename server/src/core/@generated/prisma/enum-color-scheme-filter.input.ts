import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { ColorScheme } from './color-scheme.enum';
import { NestedEnumColorSchemeFilter } from './nested-enum-color-scheme-filter.input';

@InputType()
export class EnumColorSchemeFilter {

    @Field(() => ColorScheme, {nullable:true})
    equals?: keyof typeof ColorScheme;

    @Field(() => [ColorScheme], {nullable:true})
    in?: Array<keyof typeof ColorScheme>;

    @Field(() => [ColorScheme], {nullable:true})
    notIn?: Array<keyof typeof ColorScheme>;

    @Field(() => NestedEnumColorSchemeFilter, {nullable:true})
    not?: NestedEnumColorSchemeFilter;
}
