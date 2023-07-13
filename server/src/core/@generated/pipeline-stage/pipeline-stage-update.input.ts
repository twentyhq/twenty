import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressUpdateManyWithoutPipelineStageNestedInput } from '../pipeline-progress/pipeline-progress-update-many-without-pipeline-stage-nested.input';
import { PipelineUpdateOneRequiredWithoutPipelineStagesNestedInput } from '../pipeline/pipeline-update-one-required-without-pipeline-stages-nested.input';
import { WorkspaceUpdateOneRequiredWithoutPipelineStagesNestedInput } from '../workspace/workspace-update-one-required-without-pipeline-stages-nested.input';

@InputType()
export class PipelineStageUpdateInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    name?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    type?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    color?: string;

    @Field(() => Int, {nullable:true})
    @Validator.IsNumber()
    @Validator.IsOptional()
    index?: number;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => PipelineProgressUpdateManyWithoutPipelineStageNestedInput, {nullable:true})
    pipelineProgresses?: PipelineProgressUpdateManyWithoutPipelineStageNestedInput;

    @Field(() => PipelineUpdateOneRequiredWithoutPipelineStagesNestedInput, {nullable:true})
    pipeline?: PipelineUpdateOneRequiredWithoutPipelineStagesNestedInput;

    @HideField()
    workspace?: WorkspaceUpdateOneRequiredWithoutPipelineStagesNestedInput;
}
