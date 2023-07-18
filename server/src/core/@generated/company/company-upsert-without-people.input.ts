import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyUpdateWithoutPeopleInput } from './company-update-without-people.input';
import { HideField } from '@nestjs/graphql';
import { CompanyCreateWithoutPeopleInput } from './company-create-without-people.input';

@InputType()
export class CompanyUpsertWithoutPeopleInput {

    @HideField()
    update!: CompanyUpdateWithoutPeopleInput;

    @HideField()
    create!: CompanyCreateWithoutPeopleInput;
}
