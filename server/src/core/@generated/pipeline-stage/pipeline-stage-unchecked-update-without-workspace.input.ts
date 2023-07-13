import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressUncheckedUpdateManyWithoutPipelineStageNestedInput } from '../pipeline-progress/pipeline-progress-unchecked-update-many-without-pipeline-stage-nested.input';

@InputType()
export class PipelineStageUncheckedUpdateWithoutWorkspaceInput {

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

    @Field(() => String, {nullable:true})
    pipelineId?: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => PipelineProgressUncheckedUpdateManyWithoutPipelineStageNestedInput, {nullable:true})
    pipelineProgresses?: PipelineProgressUncheckedUpdateManyWithoutPipelineStageNestedInput;
}
