import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineStageUpdateWithoutPipelineInput } from './pipeline-stage-update-without-pipeline.input';
import { HideField } from '@nestjs/graphql';
import { PipelineStageCreateWithoutPipelineInput } from './pipeline-stage-create-without-pipeline.input';

@InputType()
export class PipelineStageUpsertWithWhereUniqueWithoutPipelineInput {

    @Field(() => PipelineStageWhereUniqueInput, {nullable:false})
    @Type(() => PipelineStageWhereUniqueInput)
    where!: PipelineStageWhereUniqueInput;

    @HideField()
    update!: PipelineStageUpdateWithoutPipelineInput;

    @HideField()
    create!: PipelineStageCreateWithoutPipelineInput;
}
