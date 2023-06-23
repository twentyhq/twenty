import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineWhereInput } from './pipeline-where.input';

@InputType()
export class PipelineRelationFilter {

    @Field(() => PipelineWhereInput, {nullable:true})
    is?: PipelineWhereInput;

    @Field(() => PipelineWhereInput, {nullable:true})
    isNot?: PipelineWhereInput;
}
