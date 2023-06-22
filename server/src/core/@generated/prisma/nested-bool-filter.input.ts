import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';

@InputType()
export class NestedBoolFilter {

    @Field(() => Boolean, {nullable:true})
    equals?: boolean;

    @Field(() => NestedBoolFilter, {nullable:true})
    not?: NestedBoolFilter;
}
