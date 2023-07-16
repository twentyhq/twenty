import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { NullableStringFieldUpdateOperationsInput } from '../prisma/nullable-string-field-update-operations.input';
import { EnumActivityTypeFieldUpdateOperationsInput } from '../prisma/enum-activity-type-field-update-operations.input';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { CommentThreadTargetUncheckedUpdateManyWithoutCommentThreadNestedInput } from '../comment-thread-target/comment-thread-target-unchecked-update-many-without-comment-thread-nested.input';
import { CommentUncheckedUpdateManyWithoutCommentThreadNestedInput } from '../comment/comment-unchecked-update-many-without-comment-thread-nested.input';

@InputType()
export class CommentThreadUncheckedUpdateWithoutWorkspaceInput {

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    id?: StringFieldUpdateOperationsInput;

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    authorId?: StringFieldUpdateOperationsInput;

    @Field(() => NullableStringFieldUpdateOperationsInput, {nullable:true})
    body?: NullableStringFieldUpdateOperationsInput;

    @Field(() => NullableStringFieldUpdateOperationsInput, {nullable:true})
    title?: NullableStringFieldUpdateOperationsInput;

    @Field(() => EnumActivityTypeFieldUpdateOperationsInput, {nullable:true})
    type?: EnumActivityTypeFieldUpdateOperationsInput;

    @Field(() => NullableDateTimeFieldUpdateOperationsInput, {nullable:true})
    reminderAt?: NullableDateTimeFieldUpdateOperationsInput;

    @Field(() => NullableDateTimeFieldUpdateOperationsInput, {nullable:true})
    dueAt?: NullableDateTimeFieldUpdateOperationsInput;

    @Field(() => NullableDateTimeFieldUpdateOperationsInput, {nullable:true})
    completedAt?: NullableDateTimeFieldUpdateOperationsInput;

    @Field(() => NullableStringFieldUpdateOperationsInput, {nullable:true})
    assigneeId?: NullableStringFieldUpdateOperationsInput;

    @HideField()
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    createdAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    updatedAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => CommentThreadTargetUncheckedUpdateManyWithoutCommentThreadNestedInput, {nullable:true})
    commentThreadTargets?: CommentThreadTargetUncheckedUpdateManyWithoutCommentThreadNestedInput;

    @Field(() => CommentUncheckedUpdateManyWithoutCommentThreadNestedInput, {nullable:true})
    comments?: CommentUncheckedUpdateManyWithoutCommentThreadNestedInput;
}
