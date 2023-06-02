import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { HideField } from '@nestjs/graphql';
import { PipelineAssociationUncheckedUpdateManyWithoutPipelineNestedInput } from '../pipeline-association/pipeline-association-unchecked-update-many-without-pipeline-nested.input';

@InputType()
export class PipelineUncheckedUpdateWithoutPipelineStagesInput {
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

  @HideField()
  workspaceId?: StringFieldUpdateOperationsInput;

  @Field(
    () => PipelineAssociationUncheckedUpdateManyWithoutPipelineNestedInput,
    { nullable: true },
  )
  pipelineAssociations?: PipelineAssociationUncheckedUpdateManyWithoutPipelineNestedInput;
}
