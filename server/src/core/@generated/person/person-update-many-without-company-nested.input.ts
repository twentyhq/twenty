import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonCreateWithoutCompanyInput } from './person-create-without-company.input';
import { HideField } from '@nestjs/graphql';
import { PersonCreateOrConnectWithoutCompanyInput } from './person-create-or-connect-without-company.input';
import { PersonUpsertWithWhereUniqueWithoutCompanyInput } from './person-upsert-with-where-unique-without-company.input';
import { PersonCreateManyCompanyInputEnvelope } from './person-create-many-company-input-envelope.input';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Type } from 'class-transformer';
import { PersonUpdateWithWhereUniqueWithoutCompanyInput } from './person-update-with-where-unique-without-company.input';
import { PersonUpdateManyWithWhereWithoutCompanyInput } from './person-update-many-with-where-without-company.input';
import { PersonScalarWhereInput } from './person-scalar-where.input';

@InputType()
export class PersonUpdateManyWithoutCompanyNestedInput {

    @HideField()
    create?: Array<PersonCreateWithoutCompanyInput>;

    @HideField()
    connectOrCreate?: Array<PersonCreateOrConnectWithoutCompanyInput>;

    @HideField()
    upsert?: Array<PersonUpsertWithWhereUniqueWithoutCompanyInput>;

    @HideField()
    createMany?: PersonCreateManyCompanyInputEnvelope;

    @HideField()
    set?: Array<PersonWhereUniqueInput>;

    @HideField()
    disconnect?: Array<PersonWhereUniqueInput>;

    @HideField()
    delete?: Array<PersonWhereUniqueInput>;

    @Field(() => [PersonWhereUniqueInput], {nullable:true})
    @Type(() => PersonWhereUniqueInput)
    connect?: Array<PersonWhereUniqueInput>;

    @HideField()
    update?: Array<PersonUpdateWithWhereUniqueWithoutCompanyInput>;

    @HideField()
    updateMany?: Array<PersonUpdateManyWithWhereWithoutCompanyInput>;

    @HideField()
    deleteMany?: Array<PersonScalarWhereInput>;
}
