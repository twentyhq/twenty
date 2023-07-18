import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonCreateWithoutCompanyInput } from './person-create-without-company.input';
import { HideField } from '@nestjs/graphql';
import { PersonCreateOrConnectWithoutCompanyInput } from './person-create-or-connect-without-company.input';
import { PersonCreateManyCompanyInputEnvelope } from './person-create-many-company-input-envelope.input';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class PersonUncheckedCreateNestedManyWithoutCompanyInput {

    @HideField()
    create?: Array<PersonCreateWithoutCompanyInput>;

    @HideField()
    connectOrCreate?: Array<PersonCreateOrConnectWithoutCompanyInput>;

    @HideField()
    createMany?: PersonCreateManyCompanyInputEnvelope;

    @Field(() => [PersonWhereUniqueInput], {nullable:true})
    @Type(() => PersonWhereUniqueInput)
    connect?: Array<PersonWhereUniqueInput>;
}
