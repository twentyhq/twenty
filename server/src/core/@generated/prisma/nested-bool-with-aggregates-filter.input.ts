import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { NestedIntFilter } from './nested-int-filter.input';
import { NestedBoolFilter } from './nested-bool-filter.input';

@InputType()
export class NestedBoolWithAggregatesFilter {

    @Field(() => Boolean, {nullable:true})
    equals?: boolean;

    @Field(() => NestedBoolWithAggregatesFilter, {nullable:true})
    not?: NestedBoolWithAggregatesFilter;

    @Field(() => NestedIntFilter, {nullable:true})
    _count?: NestedIntFilter;

    @Field(() => NestedBoolFilter, {nullable:true})
    _min?: NestedBoolFilter;

    @Field(() => NestedBoolFilter, {nullable:true})
    _max?: NestedBoolFilter;
}
