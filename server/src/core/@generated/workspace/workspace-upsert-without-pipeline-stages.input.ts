import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutPipelineStagesInput } from './workspace-update-without-pipeline-stages.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPipelineStagesInput } from './workspace-create-without-pipeline-stages.input';

@InputType()
export class WorkspaceUpsertWithoutPipelineStagesInput {

    @HideField()
    update!: WorkspaceUpdateWithoutPipelineStagesInput;

    @HideField()
    create!: WorkspaceCreateWithoutPipelineStagesInput;
}
