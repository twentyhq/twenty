import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateWithoutPeopleInput } from './company-create-without-people.input';
import { Type } from 'class-transformer';
import { CompanyCreateOrConnectWithoutPeopleInput } from './company-create-or-connect-without-people.input';
import { CompanyWhereUniqueInput } from './company-where-unique.input';

@InputType()
export class CompanyCreateNestedOneWithoutPeopleInput {

    @Field(() => CompanyCreateWithoutPeopleInput, {nullable:true})
    @Type(() => CompanyCreateWithoutPeopleInput)
    create?: CompanyCreateWithoutPeopleInput;

    @Field(() => CompanyCreateOrConnectWithoutPeopleInput, {nullable:true})
    @Type(() => CompanyCreateOrConnectWithoutPeopleInput)
    connectOrCreate?: CompanyCreateOrConnectWithoutPeopleInput;

    @Field(() => CompanyWhereUniqueInput, {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    connect?: CompanyWhereUniqueInput;
}
