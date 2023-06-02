import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { PipelineStageUncheckedUpdateManyWithoutPipelineNestedInput } from '../pipeline-stage/pipeline-stage-unchecked-update-many-without-pipeline-nested.input';
import { PipelineAssociationUncheckedUpdateManyWithoutPipelineNestedInput } from '../pipeline-association/pipeline-association-unchecked-update-many-without-pipeline-nested.input';

@InputType()
export class PipelineUncheckedUpdateWithoutWorkspaceInput {
  @Field(() => StringFieldUpdateOperationsInput, { nullable: true })
  id?: StringFieldUpdateOperationsInput;

  @Field(() => DateTimeFieldUpdateOperationsInput, { nullable: true })
  createdAt?: DateTimeFieldUpdateOperationsInput;

  @Field(() => DateTimeFieldUpdateOperationsInput, { nullable: true })
  updatedAt?: DateTimeFieldUpdateOperationsInput;

  @Field(() => NullableDateTimeFieldUpdateOperationsInput, { nullable: true })
  deletedAt?: NullableDateTimeFieldUpdateOperationsInput;

  @Field(() => StringFieldUpdateOperationsInput, { nullable: true })
  name?: StringFieldUpdateOperationsInput;

  @Field(() => StringFieldUpdateOperationsInput, { nullable: true })
  icon?: StringFieldUpdateOperationsInput;

  @Field(() => PipelineStageUncheckedUpdateManyWithoutPipelineNestedInput, {
    nullable: true,
  })
  pipelineStages?: PipelineStageUncheckedUpdateManyWithoutPipelineNestedInput;

  @Field(
    () => PipelineAssociationUncheckedUpdateManyWithoutPipelineNestedInput,
    { nullable: true },
  )
  pipelineAssociations?: PipelineAssociationUncheckedUpdateManyWithoutPipelineNestedInput;
}
