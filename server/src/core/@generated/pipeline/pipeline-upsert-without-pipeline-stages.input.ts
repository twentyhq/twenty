import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineUpdateWithoutPipelineStagesInput } from './pipeline-update-without-pipeline-stages.input';
import { HideField } from '@nestjs/graphql';
import { PipelineCreateWithoutPipelineStagesInput } from './pipeline-create-without-pipeline-stages.input';

@InputType()
export class PipelineUpsertWithoutPipelineStagesInput {

    @HideField()
    update!: PipelineUpdateWithoutPipelineStagesInput;

    @HideField()
    create!: PipelineCreateWithoutPipelineStagesInput;
}
