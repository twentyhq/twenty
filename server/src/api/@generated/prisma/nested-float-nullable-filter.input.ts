import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { Float } from '@nestjs/graphql';

@InputType()
export class NestedFloatNullableFilter {

    @Field(() => Float, {nullable:true})
    equals?: number;

    @Field(() => [Float], {nullable:true})
    in?: Array<number>;

    @Field(() => [Float], {nullable:true})
    notIn?: Array<number>;

    @Field(() => Float, {nullable:true})
    lt?: number;

    @Field(() => Float, {nullable:true})
    lte?: number;

    @Field(() => Float, {nullable:true})
    gt?: number;

    @Field(() => Float, {nullable:true})
    gte?: number;

    @Field(() => NestedFloatNullableFilter, {nullable:true})
    not?: NestedFloatNullableFilter;
}
