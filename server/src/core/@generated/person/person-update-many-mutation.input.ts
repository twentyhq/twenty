import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';

@InputType()
export class PersonUpdateManyMutationInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    firstName?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    lastName?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    email?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    phone?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    city?: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;
}
