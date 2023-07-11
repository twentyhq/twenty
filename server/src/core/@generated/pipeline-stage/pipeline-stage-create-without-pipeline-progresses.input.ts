import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { PipelineCreateNestedOneWithoutPipelineStagesInput } from '../pipeline/pipeline-create-nested-one-without-pipeline-stages.input';
import { WorkspaceCreateNestedOneWithoutPipelineStagesInput } from '../workspace/workspace-create-nested-one-without-pipeline-stages.input';

@InputType()
export class PipelineStageCreateWithoutPipelineProgressesInput {

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

    @Field(() => PipelineCreateNestedOneWithoutPipelineStagesInput, {nullable:false})
    pipeline!: PipelineCreateNestedOneWithoutPipelineStagesInput;

    @HideField()
    workspace!: WorkspaceCreateNestedOneWithoutPipelineStagesInput;
}
