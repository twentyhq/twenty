import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';

@InputType()
export class PipelineStageAvgAggregateInput {

    @Field(() => Boolean, {nullable:true})
    index?: true;
}
