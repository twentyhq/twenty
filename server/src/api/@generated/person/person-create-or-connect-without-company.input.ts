import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Type } from 'class-transformer';
import { PersonCreateWithoutCompanyInput } from './person-create-without-company.input';

@InputType()
export class PersonCreateOrConnectWithoutCompanyInput {

    @Field(() => PersonWhereUniqueInput, {nullable:false})
    @Type(() => PersonWhereUniqueInput)
    where!: PersonWhereUniqueInput;

    @Field(() => PersonCreateWithoutCompanyInput, {nullable:false})
    @Type(() => PersonCreateWithoutCompanyInput)
    create!: PersonCreateWithoutCompanyInput;
}
