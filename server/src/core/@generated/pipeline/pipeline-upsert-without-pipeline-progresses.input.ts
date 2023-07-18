import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineUpdateWithoutPipelineProgressesInput } from './pipeline-update-without-pipeline-progresses.input';
import { HideField } from '@nestjs/graphql';
import { PipelineCreateWithoutPipelineProgressesInput } from './pipeline-create-without-pipeline-progresses.input';

@InputType()
export class PipelineUpsertWithoutPipelineProgressesInput {

    @HideField()
    update!: PipelineUpdateWithoutPipelineProgressesInput;

    @HideField()
    create!: PipelineCreateWithoutPipelineProgressesInput;
}
