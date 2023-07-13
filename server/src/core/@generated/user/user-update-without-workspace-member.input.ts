import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { CompanyUpdateManyWithoutAccountOwnerNestedInput } from '../company/company-update-many-without-account-owner-nested.input';
import { RefreshTokenUpdateManyWithoutUserNestedInput } from '../refresh-token/refresh-token-update-many-without-user-nested.input';
import { CommentUpdateManyWithoutAuthorNestedInput } from '../comment/comment-update-many-without-author-nested.input';
import { CommentThreadUpdateManyWithoutAuthorNestedInput } from '../comment-thread/comment-thread-update-many-without-author-nested.input';

@InputType()
export class UserUpdateWithoutWorkspaceMemberInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    firstName?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    lastName?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsEmail()
    email?: string;

    @Field(() => Boolean, {nullable:true})
    @Validator.IsBoolean()
    @Validator.IsOptional()
    emailVerified?: boolean;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    avatarUrl?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    locale?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    phoneNumber?: string;

    @Field(() => Date, {nullable:true})
    @Validator.IsDate()
    @Validator.IsOptional()
    lastSeen?: Date | string;

    @Field(() => Boolean, {nullable:true})
    @Validator.IsBoolean()
    @Validator.IsOptional()
    disabled?: boolean;

    @HideField()
    passwordHash?: string;

    @Field(() => GraphQLJSON, {nullable:true})
    @Validator.IsJSON()
    @Validator.IsOptional()
    metadata?: any;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => CompanyUpdateManyWithoutAccountOwnerNestedInput, {nullable:true})
    companies?: CompanyUpdateManyWithoutAccountOwnerNestedInput;

    @HideField()
    refreshTokens?: RefreshTokenUpdateManyWithoutUserNestedInput;

    @Field(() => CommentUpdateManyWithoutAuthorNestedInput, {nullable:true})
    comments?: CommentUpdateManyWithoutAuthorNestedInput;

    @Field(() => CommentThreadUpdateManyWithoutAuthorNestedInput, {nullable:true})
    CommentThread?: CommentThreadUpdateManyWithoutAuthorNestedInput;
}
