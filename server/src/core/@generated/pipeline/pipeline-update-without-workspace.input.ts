import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { PipelineStageUpdateManyWithoutPipelineNestedInput } from '../pipeline-stage/pipeline-stage-update-many-without-pipeline-nested.input';
import { PipelineProgressUpdateManyWithoutPipelineNestedInput } from '../pipeline-progress/pipeline-progress-update-many-without-pipeline-nested.input';

@InputType()
export class PipelineUpdateWithoutWorkspaceInput {

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    id?: StringFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    createdAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    updatedAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => NullableDateTimeFieldUpdateOperationsInput, {nullable:true})
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput;

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    name?: StringFieldUpdateOperationsInput;

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    icon?: StringFieldUpdateOperationsInput;

    @Field(() => PipelineStageUpdateManyWithoutPipelineNestedInput, {nullable:true})
    pipelineStages?: PipelineStageUpdateManyWithoutPipelineNestedInput;

    @Field(() => PipelineProgressUpdateManyWithoutPipelineNestedInput, {nullable:true})
    pipelineProgresses?: PipelineProgressUpdateManyWithoutPipelineNestedInput;
}
