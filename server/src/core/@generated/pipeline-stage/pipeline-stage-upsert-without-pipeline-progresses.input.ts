import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageUpdateWithoutPipelineProgressesInput } from './pipeline-stage-update-without-pipeline-progresses.input';
import { HideField } from '@nestjs/graphql';
import { PipelineStageCreateWithoutPipelineProgressesInput } from './pipeline-stage-create-without-pipeline-progresses.input';

@InputType()
export class PipelineStageUpsertWithoutPipelineProgressesInput {

    @HideField()
    update!: PipelineStageUpdateWithoutPipelineProgressesInput;

    @HideField()
    create!: PipelineStageCreateWithoutPipelineProgressesInput;
}
