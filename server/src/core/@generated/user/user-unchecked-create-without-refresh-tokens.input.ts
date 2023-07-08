import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { WorkspaceMemberUncheckedCreateNestedOneWithoutUserInput } from '../workspace-member/workspace-member-unchecked-create-nested-one-without-user.input';
import { CompanyUncheckedCreateNestedManyWithoutAccountOwnerInput } from '../company/company-unchecked-create-nested-many-without-account-owner.input';
import { CommentUncheckedCreateNestedManyWithoutAuthorInput } from '../comment/comment-unchecked-create-nested-many-without-author.input';
import { CommentThreadUncheckedCreateNestedManyWithoutAuthorInput } from '../comment-thread/comment-thread-unchecked-create-nested-many-without-author.input';

@InputType()
export class UserUncheckedCreateWithoutRefreshTokensInput {

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

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    locale!: string;

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

    @HideField()
    workspaceMember?: WorkspaceMemberUncheckedCreateNestedOneWithoutUserInput;

    @Field(() => CompanyUncheckedCreateNestedManyWithoutAccountOwnerInput, {nullable:true})
    companies?: CompanyUncheckedCreateNestedManyWithoutAccountOwnerInput;

    @Field(() => CommentUncheckedCreateNestedManyWithoutAuthorInput, {nullable:true})
    comments?: CommentUncheckedCreateNestedManyWithoutAuthorInput;

    @Field(() => CommentThreadUncheckedCreateNestedManyWithoutAuthorInput, {nullable:true})
    CommentThread?: CommentThreadUncheckedCreateNestedManyWithoutAuthorInput;
}
