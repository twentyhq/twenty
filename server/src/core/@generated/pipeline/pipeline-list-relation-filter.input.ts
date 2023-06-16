import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineWhereInput } from './pipeline-where.input';

@InputType()
export class PipelineListRelationFilter {

    @Field(() => PipelineWhereInput, {nullable:true})
    every?: PipelineWhereInput;

    @Field(() => PipelineWhereInput, {nullable:true})
    some?: PipelineWhereInput;

    @Field(() => PipelineWhereInput, {nullable:true})
    none?: PipelineWhereInput;
}
