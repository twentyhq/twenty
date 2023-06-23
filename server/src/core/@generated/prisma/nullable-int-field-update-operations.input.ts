import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';

@InputType()
export class NullableIntFieldUpdateOperationsInput {

    @Field(() => Int, {nullable:true})
    set?: number;

    @Field(() => Int, {nullable:true})
    increment?: number;

    @Field(() => Int, {nullable:true})
    decrement?: number;

    @Field(() => Int, {nullable:true})
    multiply?: number;

    @Field(() => Int, {nullable:true})
    divide?: number;
}
