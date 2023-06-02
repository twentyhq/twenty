import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { EnumPipelineAssociableTypeFieldUpdateOperationsInput } from '../prisma/enum-pipeline-associable-type-field-update-operations.input';
import { PipelineUpdateOneRequiredWithoutPipelineAssociationsNestedInput } from '../pipeline/pipeline-update-one-required-without-pipeline-associations-nested.input';

@InputType()
export class PipelineAssociationUpdateWithoutPipelineStageInput {
  @Field(() => StringFieldUpdateOperationsInput, { nullable: true })
  id?: StringFieldUpdateOperationsInput;

  @Field(() => DateTimeFieldUpdateOperationsInput, { nullable: true })
  createdAt?: DateTimeFieldUpdateOperationsInput;

  @Field(() => DateTimeFieldUpdateOperationsInput, { nullable: true })
  updatedAt?: DateTimeFieldUpdateOperationsInput;

  @Field(() => NullableDateTimeFieldUpdateOperationsInput, { nullable: true })
  deletedAt?: NullableDateTimeFieldUpdateOperationsInput;

  @Field(() => EnumPipelineAssociableTypeFieldUpdateOperationsInput, {
    nullable: true,
  })
  associableType?: EnumPipelineAssociableTypeFieldUpdateOperationsInput;

  @Field(() => StringFieldUpdateOperationsInput, { nullable: true })
  associableId?: StringFieldUpdateOperationsInput;

  @Field(
    () => PipelineUpdateOneRequiredWithoutPipelineAssociationsNestedInput,
    { nullable: true },
  )
  pipeline?: PipelineUpdateOneRequiredWithoutPipelineAssociationsNestedInput;
}
