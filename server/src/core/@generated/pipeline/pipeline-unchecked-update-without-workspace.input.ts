import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { PipelineProgressableType } from '../prisma/pipeline-progressable-type.enum';
import { HideField } from '@nestjs/graphql';
import { PipelineStageUncheckedUpdateManyWithoutPipelineNestedInput } from '../pipeline-stage/pipeline-stage-unchecked-update-many-without-pipeline-nested.input';
import { PipelineProgressUncheckedUpdateManyWithoutPipelineNestedInput } from '../pipeline-progress/pipeline-progress-unchecked-update-many-without-pipeline-nested.input';

@InputType()
export class PipelineUncheckedUpdateWithoutWorkspaceInput {

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

    @Field(() => PipelineStageUncheckedUpdateManyWithoutPipelineNestedInput, {nullable:true})
    pipelineStages?: PipelineStageUncheckedUpdateManyWithoutPipelineNestedInput;

    @Field(() => PipelineProgressUncheckedUpdateManyWithoutPipelineNestedInput, {nullable:true})
    pipelineProgresses?: PipelineProgressUncheckedUpdateManyWithoutPipelineNestedInput;
}
