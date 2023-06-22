import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateWithoutPeopleInput } from './company-create-without-people.input';
import { HideField } from '@nestjs/graphql';
import { CompanyCreateOrConnectWithoutPeopleInput } from './company-create-or-connect-without-people.input';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class CompanyCreateNestedOneWithoutPeopleInput {

    @HideField()
    create?: CompanyCreateWithoutPeopleInput;

    @HideField()
    connectOrCreate?: CompanyCreateOrConnectWithoutPeopleInput;

    @Field(() => CompanyWhereUniqueInput, {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    connect?: CompanyWhereUniqueInput;
}
