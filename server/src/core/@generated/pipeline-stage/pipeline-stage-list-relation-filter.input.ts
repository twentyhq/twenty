import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageWhereInput } from './pipeline-stage-where.input';

@InputType()
export class PipelineStageListRelationFilter {

    @Field(() => PipelineStageWhereInput, {nullable:true})
    every?: PipelineStageWhereInput;

    @Field(() => PipelineStageWhereInput, {nullable:true})
    some?: PipelineStageWhereInput;

    @Field(() => PipelineStageWhereInput, {nullable:true})
    none?: PipelineStageWhereInput;
}
