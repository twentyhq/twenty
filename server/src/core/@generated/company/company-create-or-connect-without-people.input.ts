import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';
import { CompanyCreateWithoutPeopleInput } from './company-create-without-people.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CompanyCreateOrConnectWithoutPeopleInput {

    @Field(() => CompanyWhereUniqueInput, {nullable:false})
    @Type(() => CompanyWhereUniqueInput)
    where!: CompanyWhereUniqueInput;

    @HideField()
    create!: CompanyCreateWithoutPeopleInput;
}
