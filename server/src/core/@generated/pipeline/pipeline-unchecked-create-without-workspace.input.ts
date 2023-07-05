import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { PipelineProgressableType } from '../prisma/pipeline-progressable-type.enum';
import { HideField } from '@nestjs/graphql';
import { PipelineStageUncheckedCreateNestedManyWithoutPipelineInput } from '../pipeline-stage/pipeline-stage-unchecked-create-nested-many-without-pipeline.input';
import { PipelineProgressUncheckedCreateNestedManyWithoutPipelineInput } from '../pipeline-progress/pipeline-progress-unchecked-create-nested-many-without-pipeline.input';

@InputType()
export class PipelineUncheckedCreateWithoutWorkspaceInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    name!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    icon!: string;

    @Field(() => PipelineProgressableType, {nullable:true})
    pipelineProgressableType?: keyof typeof PipelineProgressableType;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => PipelineStageUncheckedCreateNestedManyWithoutPipelineInput, {nullable:true})
    pipelineStages?: PipelineStageUncheckedCreateNestedManyWithoutPipelineInput;

    @Field(() => PipelineProgressUncheckedCreateNestedManyWithoutPipelineInput, {nullable:true})
    pipelineProgresses?: PipelineProgressUncheckedCreateNestedManyWithoutPipelineInput;
}
