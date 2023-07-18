import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { EnumAttachmentTypeFieldUpdateOperationsInput } from '../prisma/enum-attachment-type-field-update-operations.input';
import { HideField } from '@nestjs/graphql';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { UserUpdateOneRequiredWithoutAuthoredAttachmentsNestedInput } from '../user/user-update-one-required-without-authored-attachments-nested.input';

@InputType()
export class AttachmentUpdateWithoutActivityInput {

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    id?: StringFieldUpdateOperationsInput;

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    fullPath?: StringFieldUpdateOperationsInput;

    @Field(() => EnumAttachmentTypeFieldUpdateOperationsInput, {nullable:true})
    type?: EnumAttachmentTypeFieldUpdateOperationsInput;

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    name?: StringFieldUpdateOperationsInput;

    @HideField()
    workspaceId?: StringFieldUpdateOperationsInput;

    @HideField()
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    createdAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    updatedAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => UserUpdateOneRequiredWithoutAuthoredAttachmentsNestedInput, {nullable:true})
    author?: UserUpdateOneRequiredWithoutAuthoredAttachmentsNestedInput;
}
