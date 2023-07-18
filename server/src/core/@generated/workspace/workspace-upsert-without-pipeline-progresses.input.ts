import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutPipelineProgressesInput } from './workspace-update-without-pipeline-progresses.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPipelineProgressesInput } from './workspace-create-without-pipeline-progresses.input';

@InputType()
export class WorkspaceUpsertWithoutPipelineProgressesInput {

    @HideField()
    update!: WorkspaceUpdateWithoutPipelineProgressesInput;

    @HideField()
    create!: WorkspaceCreateWithoutPipelineProgressesInput;
}
