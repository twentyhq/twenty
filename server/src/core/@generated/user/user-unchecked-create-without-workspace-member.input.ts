import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { CompanyUncheckedCreateNestedManyWithoutAccountOwnerInput } from '../company/company-unchecked-create-nested-many-without-account-owner.input';
import { RefreshTokenUncheckedCreateNestedManyWithoutUserInput } from '../refresh-token/refresh-token-unchecked-create-nested-many-without-user.input';
import { CommentUncheckedCreateNestedManyWithoutAuthorInput } from '../comment/comment-unchecked-create-nested-many-without-author.input';
import { CommentThreadUncheckedCreateNestedManyWithoutAuthorInput } from '../comment-thread/comment-thread-unchecked-create-nested-many-without-author.input';
import { CommentThreadUncheckedCreateNestedManyWithoutAssigneeInput } from '../comment-thread/comment-thread-unchecked-create-nested-many-without-assignee.input';

@InputType()
export class UserUncheckedCreateWithoutWorkspaceMemberInput {

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

    @Field(() => String, {nullable:false})
    @Validator.IsEmail()
    email!: string;

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

    @Field(() => String, {nullable:false})
    settingsId!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => CompanyUncheckedCreateNestedManyWithoutAccountOwnerInput, {nullable:true})
    companies?: CompanyUncheckedCreateNestedManyWithoutAccountOwnerInput;

    @HideField()
    refreshTokens?: RefreshTokenUncheckedCreateNestedManyWithoutUserInput;

    @Field(() => CommentUncheckedCreateNestedManyWithoutAuthorInput, {nullable:true})
    comments?: CommentUncheckedCreateNestedManyWithoutAuthorInput;

    @Field(() => CommentThreadUncheckedCreateNestedManyWithoutAuthorInput, {nullable:true})
    authoredCommentThreads?: CommentThreadUncheckedCreateNestedManyWithoutAuthorInput;

    @Field(() => CommentThreadUncheckedCreateNestedManyWithoutAssigneeInput, {nullable:true})
    assignedCommentThreads?: CommentThreadUncheckedCreateNestedManyWithoutAssigneeInput;
}
