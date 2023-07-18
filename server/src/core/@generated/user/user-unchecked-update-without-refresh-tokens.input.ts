import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { NullableStringFieldUpdateOperationsInput } from '../prisma/nullable-string-field-update-operations.input';
import { BoolFieldUpdateOperationsInput } from '../prisma/bool-field-update-operations.input';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { HideField } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import * as Validator from 'class-validator';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { WorkspaceMemberUncheckedUpdateOneWithoutUserNestedInput } from '../workspace-member/workspace-member-unchecked-update-one-without-user-nested.input';
import { CompanyUncheckedUpdateManyWithoutAccountOwnerNestedInput } from '../company/company-unchecked-update-many-without-account-owner-nested.input';
import { CommentUncheckedUpdateManyWithoutAuthorNestedInput } from '../comment/comment-unchecked-update-many-without-author-nested.input';
import { CommentThreadUncheckedUpdateManyWithoutAuthorNestedInput } from '../comment-thread/comment-thread-unchecked-update-many-without-author-nested.input';
import { CommentThreadUncheckedUpdateManyWithoutAssigneeNestedInput } from '../comment-thread/comment-thread-unchecked-update-many-without-assignee-nested.input';
import { AttachmentUncheckedUpdateManyWithoutAuthorNestedInput } from '../attachment/attachment-unchecked-update-many-without-author-nested.input';

@InputType()
export class UserUncheckedUpdateWithoutRefreshTokensInput {

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    id?: StringFieldUpdateOperationsInput;

    @Field(() => NullableStringFieldUpdateOperationsInput, {nullable:true})
    firstName?: NullableStringFieldUpdateOperationsInput;

    @Field(() => NullableStringFieldUpdateOperationsInput, {nullable:true})
    lastName?: NullableStringFieldUpdateOperationsInput;

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    email?: StringFieldUpdateOperationsInput;

    @Field(() => BoolFieldUpdateOperationsInput, {nullable:true})
    emailVerified?: BoolFieldUpdateOperationsInput;

    @Field(() => NullableStringFieldUpdateOperationsInput, {nullable:true})
    avatarUrl?: NullableStringFieldUpdateOperationsInput;

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    locale?: StringFieldUpdateOperationsInput;

    @Field(() => NullableStringFieldUpdateOperationsInput, {nullable:true})
    phoneNumber?: NullableStringFieldUpdateOperationsInput;

    @Field(() => NullableDateTimeFieldUpdateOperationsInput, {nullable:true})
    lastSeen?: NullableDateTimeFieldUpdateOperationsInput;

    @Field(() => BoolFieldUpdateOperationsInput, {nullable:true})
    disabled?: BoolFieldUpdateOperationsInput;

    @HideField()
    passwordHash?: NullableStringFieldUpdateOperationsInput;

    @Field(() => GraphQLJSON, {nullable:true})
    @Validator.IsJSON()
    @Validator.IsOptional()
    metadata?: any;

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    settingsId?: StringFieldUpdateOperationsInput;

    @HideField()
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    createdAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    updatedAt?: DateTimeFieldUpdateOperationsInput;

    @HideField()
    workspaceMember?: WorkspaceMemberUncheckedUpdateOneWithoutUserNestedInput;

    @Field(() => CompanyUncheckedUpdateManyWithoutAccountOwnerNestedInput, {nullable:true})
    companies?: CompanyUncheckedUpdateManyWithoutAccountOwnerNestedInput;

    @Field(() => CommentUncheckedUpdateManyWithoutAuthorNestedInput, {nullable:true})
    comments?: CommentUncheckedUpdateManyWithoutAuthorNestedInput;

    @Field(() => CommentThreadUncheckedUpdateManyWithoutAuthorNestedInput, {nullable:true})
    authoredCommentThreads?: CommentThreadUncheckedUpdateManyWithoutAuthorNestedInput;

    @Field(() => CommentThreadUncheckedUpdateManyWithoutAssigneeNestedInput, {nullable:true})
    assignedCommentThreads?: CommentThreadUncheckedUpdateManyWithoutAssigneeNestedInput;

    @Field(() => AttachmentUncheckedUpdateManyWithoutAuthorNestedInput, {nullable:true})
    authoredAttachments?: AttachmentUncheckedUpdateManyWithoutAuthorNestedInput;
}
