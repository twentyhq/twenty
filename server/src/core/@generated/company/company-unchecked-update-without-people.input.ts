import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CompanyUncheckedUpdateWithoutPeopleInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    name?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    domainName?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    address?: string;

    @Field(() => Int, {nullable:true})
    @Validator.IsNumber()
    @Validator.IsOptional()
    employees?: number;

    @Field(() => String, {nullable:true})
    accountOwnerId?: string;

    @HideField()
    workspaceId?: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;
}
