import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { UserCreateNestedOneWithoutCompaniesInput } from '../user/user-create-nested-one-without-companies.input';
import { PersonCreateNestedManyWithoutCompanyInput } from '../person/person-create-nested-many-without-company.input';

@InputType()
export class CompanyCreateWithoutWorkspaceInput {

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

    @Field(() => UserCreateNestedOneWithoutCompaniesInput, {nullable:true})
    accountOwner?: UserCreateNestedOneWithoutCompaniesInput;

    @Field(() => PersonCreateNestedManyWithoutCompanyInput, {nullable:true})
    people?: PersonCreateNestedManyWithoutCompanyInput;
}
