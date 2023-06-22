import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';

@InputType()
export class CompanySumAggregateInput {

    @Field(() => Boolean, {nullable:true})
    employees?: true;
}
