import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineStageUpdateWithoutPipelineInput } from './pipeline-stage-update-without-pipeline.input';

@InputType()
export class PipelineStageUpdateWithWhereUniqueWithoutPipelineInput {

    @Field(() => PipelineStageWhereUniqueInput, {nullable:false})
    @Type(() => PipelineStageWhereUniqueInput)
    where!: PipelineStageWhereUniqueInput;

    @Field(() => PipelineStageUpdateWithoutPipelineInput, {nullable:false})
    @Type(() => PipelineStageUpdateWithoutPipelineInput)
    data!: PipelineStageUpdateWithoutPipelineInput;
}
