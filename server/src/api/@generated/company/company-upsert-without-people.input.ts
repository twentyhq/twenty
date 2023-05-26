import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyUpdateWithoutPeopleInput } from './company-update-without-people.input';
import { Type } from 'class-transformer';
import { CompanyCreateWithoutPeopleInput } from './company-create-without-people.input';

@InputType()
export class CompanyUpsertWithoutPeopleInput {

    @Field(() => CompanyUpdateWithoutPeopleInput, {nullable:false})
    @Type(() => CompanyUpdateWithoutPeopleInput)
    update!: CompanyUpdateWithoutPeopleInput;

    @Field(() => CompanyCreateWithoutPeopleInput, {nullable:false})
    @Type(() => CompanyCreateWithoutPeopleInput)
    create!: CompanyCreateWithoutPeopleInput;
}
