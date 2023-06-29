import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { PersonUncheckedCreateNestedManyWithoutCompanyInput } from '../person/person-unchecked-create-nested-many-without-company.input';

@InputType()
export class CompanyUncheckedCreateWithoutAccountOwnerInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    name!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    domainName!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    address!: string;

    @Field(() => Int, {nullable:true})
    @Validator.IsNumber()
    @Validator.IsOptional()
    employees?: number;

    @HideField()
    workspaceId!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => PersonUncheckedCreateNestedManyWithoutCompanyInput, {nullable:true})
    people?: PersonUncheckedCreateNestedManyWithoutCompanyInput;
}
