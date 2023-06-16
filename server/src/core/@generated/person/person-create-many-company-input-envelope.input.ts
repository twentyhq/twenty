import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonCreateManyCompanyInput } from './person-create-many-company.input';
import { Type } from 'class-transformer';

@InputType()
export class PersonCreateManyCompanyInputEnvelope {

    @Field(() => [PersonCreateManyCompanyInput], {nullable:false})
    @Type(() => PersonCreateManyCompanyInput)
    data!: Array<PersonCreateManyCompanyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
