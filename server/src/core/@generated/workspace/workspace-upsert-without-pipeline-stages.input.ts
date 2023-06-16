import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutPipelineStagesInput } from './workspace-update-without-pipeline-stages.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutPipelineStagesInput } from './workspace-create-without-pipeline-stages.input';

@InputType()
export class WorkspaceUpsertWithoutPipelineStagesInput {

    @Field(() => WorkspaceUpdateWithoutPipelineStagesInput, {nullable:false})
    @Type(() => WorkspaceUpdateWithoutPipelineStagesInput)
    update!: WorkspaceUpdateWithoutPipelineStagesInput;

    @Field(() => WorkspaceCreateWithoutPipelineStagesInput, {nullable:false})
    @Type(() => WorkspaceCreateWithoutPipelineStagesInput)
    create!: WorkspaceCreateWithoutPipelineStagesInput;
}
