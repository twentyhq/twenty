import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { WorkspaceMemberCreateNestedOneWithoutUserInput } from '../workspace-member/workspace-member-create-nested-one-without-user.input';
import { RefreshTokenCreateNestedManyWithoutUserInput } from '../refresh-token/refresh-token-create-nested-many-without-user.input';
import { CommentCreateNestedManyWithoutAuthorInput } from '../comment/comment-create-nested-many-without-author.input';

@InputType()
export class UserCreateWithoutCompaniesInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    firstname!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    lastname!: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    displayName?: string;

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
    workspaceMember?: WorkspaceMemberCreateNestedOneWithoutUserInput;

    @HideField()
    refreshTokens?: RefreshTokenCreateNestedManyWithoutUserInput;

    @Field(() => CommentCreateNestedManyWithoutAuthorInput, {nullable:true})
    comments?: CommentCreateNestedManyWithoutAuthorInput;
}
