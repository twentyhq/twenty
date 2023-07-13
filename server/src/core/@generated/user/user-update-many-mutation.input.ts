import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class UserUpdateManyMutationInput {

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
}
