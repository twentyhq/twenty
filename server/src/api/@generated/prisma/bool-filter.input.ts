import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { NestedBoolFilter } from './nested-bool-filter.input';

@InputType()
export class BoolFilter {

    @Field(() => Boolean, {nullable:true})
    equals?: boolean;

    @Field(() => NestedBoolFilter, {nullable:true})
    not?: NestedBoolFilter;
}
