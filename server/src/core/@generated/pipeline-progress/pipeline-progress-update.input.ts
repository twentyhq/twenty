import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { EnumPipelineProgressableTypeFieldUpdateOperationsInput } from '../prisma/enum-pipeline-progressable-type-field-update-operations.input';
import { PipelineUpdateOneRequiredWithoutPipelineProgressesNestedInput } from '../pipeline/pipeline-update-one-required-without-pipeline-progresses-nested.input';
import { PipelineStageUpdateOneRequiredWithoutPipelineProgressesNestedInput } from '../pipeline-stage/pipeline-stage-update-one-required-without-pipeline-progresses-nested.input';
import { WorkspaceUpdateOneRequiredWithoutPipelineProgressesNestedInput } from '../workspace/workspace-update-one-required-without-pipeline-progresses-nested.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class PipelineProgressUpdateInput {

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    id?: StringFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    createdAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    updatedAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => NullableDateTimeFieldUpdateOperationsInput, {nullable:true})
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput;

    @Field(() => EnumPipelineProgressableTypeFieldUpdateOperationsInput, {nullable:true})
    progressableType?: EnumPipelineProgressableTypeFieldUpdateOperationsInput;

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    progressableId?: StringFieldUpdateOperationsInput;

    @Field(() => PipelineUpdateOneRequiredWithoutPipelineProgressesNestedInput, {nullable:true})
    pipeline?: PipelineUpdateOneRequiredWithoutPipelineProgressesNestedInput;

    @Field(() => PipelineStageUpdateOneRequiredWithoutPipelineProgressesNestedInput, {nullable:true})
    pipelineStage?: PipelineStageUpdateOneRequiredWithoutPipelineProgressesNestedInput;

    @HideField()
    workspace?: WorkspaceUpdateOneRequiredWithoutPipelineProgressesNestedInput;
}
