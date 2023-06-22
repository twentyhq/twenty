import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';

@InputType()
export class NestedIntFilter {

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

    @Field(() => NestedIntFilter, {nullable:true})
    not?: NestedIntFilter;
}
