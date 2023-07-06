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
import { RefreshTokenUpdateManyWithoutUserNestedInput } from '../refresh-token/refresh-token-update-many-without-user-nested.input';

@InputType()
export class UserUpdateWithoutCommentsInput {

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

    @HideField()
    refreshTokens?: RefreshTokenUpdateManyWithoutUserNestedInput;
}
