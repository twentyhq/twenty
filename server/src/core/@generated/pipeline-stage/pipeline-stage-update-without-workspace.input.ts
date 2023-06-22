import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { PipelineUpdateOneRequiredWithoutPipelineStagesNestedInput } from '../pipeline/pipeline-update-one-required-without-pipeline-stages-nested.input';
import { PipelineProgressUpdateManyWithoutPipelineStageNestedInput } from '../pipeline-progress/pipeline-progress-update-many-without-pipeline-stage-nested.input';

@InputType()
export class PipelineStageUpdateWithoutWorkspaceInput {

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
    type?: StringFieldUpdateOperationsInput;

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    color?: StringFieldUpdateOperationsInput;

    @Field(() => PipelineUpdateOneRequiredWithoutPipelineStagesNestedInput, {nullable:true})
    pipeline?: PipelineUpdateOneRequiredWithoutPipelineStagesNestedInput;

    @Field(() => PipelineProgressUpdateManyWithoutPipelineStageNestedInput, {nullable:true})
    pipelineProgresses?: PipelineProgressUpdateManyWithoutPipelineStageNestedInput;
}
