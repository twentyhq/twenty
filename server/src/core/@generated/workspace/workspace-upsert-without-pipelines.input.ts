import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutPipelinesInput } from './workspace-update-without-pipelines.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPipelinesInput } from './workspace-create-without-pipelines.input';

@InputType()
export class WorkspaceUpsertWithoutPipelinesInput {

    @HideField()
    update!: WorkspaceUpdateWithoutPipelinesInput;

    @HideField()
    create!: WorkspaceCreateWithoutPipelinesInput;
}
