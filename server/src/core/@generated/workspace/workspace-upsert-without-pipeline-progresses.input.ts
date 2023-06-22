import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutPipelineProgressesInput } from './workspace-update-without-pipeline-progresses.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutPipelineProgressesInput } from './workspace-create-without-pipeline-progresses.input';

@InputType()
export class WorkspaceUpsertWithoutPipelineProgressesInput {

    @Field(() => WorkspaceUpdateWithoutPipelineProgressesInput, {nullable:false})
    @Type(() => WorkspaceUpdateWithoutPipelineProgressesInput)
    update!: WorkspaceUpdateWithoutPipelineProgressesInput;

    @Field(() => WorkspaceCreateWithoutPipelineProgressesInput, {nullable:false})
    @Type(() => WorkspaceCreateWithoutPipelineProgressesInput)
    create!: WorkspaceCreateWithoutPipelineProgressesInput;
}
