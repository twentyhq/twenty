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
import { WorkspaceMemberUpdateOneWithoutUserNestedInput } from '../workspace-member/workspace-member-update-one-without-user-nested.input';
import { CompanyUpdateManyWithoutAccountOwnerNestedInput } from '../company/company-update-many-without-account-owner-nested.input';
import { CommentUpdateManyWithoutAuthorNestedInput } from '../comment/comment-update-many-without-author-nested.input';
import { CommentThreadUpdateManyWithoutAuthorNestedInput } from '../comment-thread/comment-thread-update-many-without-author-nested.input';
import { CommentThreadUpdateManyWithoutAssigneeNestedInput } from '../comment-thread/comment-thread-update-many-without-assignee-nested.input';
import { UserSettingsUpdateOneRequiredWithoutUserNestedInput } from '../user-settings/user-settings-update-one-required-without-user-nested.input';

@InputType()
export class UserUpdateWithoutRefreshTokensInput {

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

    @HideField()
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    createdAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    updatedAt?: DateTimeFieldUpdateOperationsInput;

    @HideField()
    workspaceMember?: WorkspaceMemberUpdateOneWithoutUserNestedInput;

    @Field(() => CompanyUpdateManyWithoutAccountOwnerNestedInput, {nullable:true})
    companies?: CompanyUpdateManyWithoutAccountOwnerNestedInput;

    @Field(() => CommentUpdateManyWithoutAuthorNestedInput, {nullable:true})
    comments?: CommentUpdateManyWithoutAuthorNestedInput;

    @Field(() => CommentThreadUpdateManyWithoutAuthorNestedInput, {nullable:true})
    authoredCommentThreads?: CommentThreadUpdateManyWithoutAuthorNestedInput;

    @Field(() => CommentThreadUpdateManyWithoutAssigneeNestedInput, {nullable:true})
    assignedCommentThreads?: CommentThreadUpdateManyWithoutAssigneeNestedInput;

    @Field(() => UserSettingsUpdateOneRequiredWithoutUserNestedInput, {nullable:true})
    settings?: UserSettingsUpdateOneRequiredWithoutUserNestedInput;
}
