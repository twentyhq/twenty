import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { CommentUpdateManyWithoutCommentThreadNestedInput } from '../comment/comment-update-many-without-comment-thread-nested.input';
import { WorkspaceUpdateOneRequiredWithoutCommentThreadsNestedInput } from '../workspace/workspace-update-one-required-without-comment-threads-nested.input';

@InputType()
export class CommentThreadUpdateWithoutCommentThreadTargetsInput {

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    id?: StringFieldUpdateOperationsInput;

    @HideField()
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    createdAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    updatedAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => CommentUpdateManyWithoutCommentThreadNestedInput, {nullable:true})
    comments?: CommentUpdateManyWithoutCommentThreadNestedInput;

    @HideField()
    workspace?: WorkspaceUpdateOneRequiredWithoutCommentThreadsNestedInput;
}
