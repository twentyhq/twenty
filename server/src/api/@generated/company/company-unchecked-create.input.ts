import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { PersonUncheckedCreateNestedManyWithoutCompanyInput } from '../person/person-unchecked-create-nested-many-without-company.input';

@InputType()
export class CompanyUncheckedCreateInput {

    @Field(() => String, {nullable:false})
    id!: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @Field(() => String, {nullable:false})
    name!: string;

    @Field(() => String, {nullable:false})
    domainName!: string;

    @Field(() => String, {nullable:false})
    address!: string;

    @Field(() => Int, {nullable:true})
    employees?: number;

    @Field(() => String, {nullable:true})
    accountOwnerId?: string;

    @HideField()
    workspaceId!: string;

    @Field(() => PersonUncheckedCreateNestedManyWithoutCompanyInput, {nullable:true})
    people?: PersonUncheckedCreateNestedManyWithoutCompanyInput;
}
