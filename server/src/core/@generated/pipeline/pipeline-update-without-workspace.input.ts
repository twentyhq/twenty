import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { PipelineProgressableType } from '../prisma/pipeline-progressable-type.enum';
import { HideField } from '@nestjs/graphql';
import { PipelineStageUpdateManyWithoutPipelineNestedInput } from '../pipeline-stage/pipeline-stage-update-many-without-pipeline-nested.input';
import { PipelineProgressUpdateManyWithoutPipelineNestedInput } from '../pipeline-progress/pipeline-progress-update-many-without-pipeline-nested.input';

@InputType()
export class PipelineUpdateWithoutWorkspaceInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    name?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    icon?: string;

    @Field(() => PipelineProgressableType, {nullable:true})
    pipelineProgressableType?: keyof typeof PipelineProgressableType;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => PipelineStageUpdateManyWithoutPipelineNestedInput, {nullable:true})
    pipelineStages?: PipelineStageUpdateManyWithoutPipelineNestedInput;

    @Field(() => PipelineProgressUpdateManyWithoutPipelineNestedInput, {nullable:true})
    pipelineProgresses?: PipelineProgressUpdateManyWithoutPipelineNestedInput;
}
