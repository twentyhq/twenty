import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Float } from '@nestjs/graphql';

@ObjectType()
export class PipelineStageAvgAggregate {

    @Field(() => Float, {nullable:true})
    index?: number;
}
