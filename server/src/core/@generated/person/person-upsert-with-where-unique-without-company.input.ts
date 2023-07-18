import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Type } from 'class-transformer';
import { PersonUpdateWithoutCompanyInput } from './person-update-without-company.input';
import { HideField } from '@nestjs/graphql';
import { PersonCreateWithoutCompanyInput } from './person-create-without-company.input';

@InputType()
export class PersonUpsertWithWhereUniqueWithoutCompanyInput {

    @Field(() => PersonWhereUniqueInput, {nullable:false})
    @Type(() => PersonWhereUniqueInput)
    where!: PersonWhereUniqueInput;

    @HideField()
    update!: PersonUpdateWithoutCompanyInput;

    @HideField()
    create!: PersonCreateWithoutCompanyInput;
}
