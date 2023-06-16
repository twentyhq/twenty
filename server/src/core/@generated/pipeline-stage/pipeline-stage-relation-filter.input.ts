import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageWhereInput } from './pipeline-stage-where.input';

@InputType()
export class PipelineStageRelationFilter {

    @Field(() => PipelineStageWhereInput, {nullable:true})
    is?: PipelineStageWhereInput;

    @Field(() => PipelineStageWhereInput, {nullable:true})
    isNot?: PipelineStageWhereInput;
}
