import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateNestedOneWithoutPeopleInput } from '../workspace/workspace-create-nested-one-without-people.input';

@InputType()
export class PersonCreateWithoutCompanyInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    firstName!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    lastName!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsEmail()
    email!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsPhoneNumber()
    phone!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    city!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @HideField()
    workspace!: WorkspaceCreateNestedOneWithoutPeopleInput;
}
