import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { Int } from '@nestjs/graphql';
import { PipelineProgressableType } from '../prisma/pipeline-progressable-type.enum';
import { HideField } from '@nestjs/graphql';
import { PipelineUpdateOneRequiredWithoutPipelineProgressesNestedInput } from '../pipeline/pipeline-update-one-required-without-pipeline-progresses-nested.input';
import { PipelineStageUpdateOneRequiredWithoutPipelineProgressesNestedInput } from '../pipeline-stage/pipeline-stage-update-one-required-without-pipeline-progresses-nested.input';

@InputType()
export class PipelineProgressUpdateWithoutWorkspaceInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => Int, {nullable:true})
    amount?: number;

    @Field(() => Date, {nullable:true})
    closeDate?: Date | string;

    @Field(() => PipelineProgressableType, {nullable:true})
    progressableType?: keyof typeof PipelineProgressableType;

    @Field(() => String, {nullable:true})
    progressableId?: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => PipelineUpdateOneRequiredWithoutPipelineProgressesNestedInput, {nullable:true})
    pipeline?: PipelineUpdateOneRequiredWithoutPipelineProgressesNestedInput;

    @Field(() => PipelineStageUpdateOneRequiredWithoutPipelineProgressesNestedInput, {nullable:true})
    pipelineStage?: PipelineStageUpdateOneRequiredWithoutPipelineProgressesNestedInput;
}
