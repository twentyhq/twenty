import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressCreateNestedManyWithoutPipelineStageInput } from '../pipeline-progress/pipeline-progress-create-nested-many-without-pipeline-stage.input';
import { WorkspaceCreateNestedOneWithoutPipelineStagesInput } from '../workspace/workspace-create-nested-one-without-pipeline-stages.input';

@InputType()
export class PipelineStageCreateWithoutPipelineInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    name!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    type!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    color!: string;

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

    @Field(() => PipelineProgressCreateNestedManyWithoutPipelineStageInput, {nullable:true})
    pipelineProgresses?: PipelineProgressCreateNestedManyWithoutPipelineStageInput;

    @HideField()
    workspace!: WorkspaceCreateNestedOneWithoutPipelineStagesInput;
}
