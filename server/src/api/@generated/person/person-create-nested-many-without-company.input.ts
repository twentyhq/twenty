import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonCreateWithoutCompanyInput } from './person-create-without-company.input';
import { Type } from 'class-transformer';
import { PersonCreateOrConnectWithoutCompanyInput } from './person-create-or-connect-without-company.input';
import { PersonCreateManyCompanyInputEnvelope } from './person-create-many-company-input-envelope.input';
import { PersonWhereUniqueInput } from './person-where-unique.input';

@InputType()
export class PersonCreateNestedManyWithoutCompanyInput {

    @Field(() => [PersonCreateWithoutCompanyInput], {nullable:true})
    @Type(() => PersonCreateWithoutCompanyInput)
    create?: Array<PersonCreateWithoutCompanyInput>;

    @Field(() => [PersonCreateOrConnectWithoutCompanyInput], {nullable:true})
    @Type(() => PersonCreateOrConnectWithoutCompanyInput)
    connectOrCreate?: Array<PersonCreateOrConnectWithoutCompanyInput>;

    @Field(() => PersonCreateManyCompanyInputEnvelope, {nullable:true})
    @Type(() => PersonCreateManyCompanyInputEnvelope)
    createMany?: PersonCreateManyCompanyInputEnvelope;

    @Field(() => [PersonWhereUniqueInput], {nullable:true})
    @Type(() => PersonWhereUniqueInput)
    connect?: Array<PersonWhereUniqueInput>;
}
