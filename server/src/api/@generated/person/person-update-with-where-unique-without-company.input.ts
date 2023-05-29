import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Type } from 'class-transformer';
import { PersonUpdateWithoutCompanyInput } from './person-update-without-company.input';

@InputType()
export class PersonUpdateWithWhereUniqueWithoutCompanyInput {
  @Field(() => PersonWhereUniqueInput, { nullable: false })
  @Type(() => PersonWhereUniqueInput)
  where!: PersonWhereUniqueInput;

  @Field(() => PersonUpdateWithoutCompanyInput, { nullable: false })
  @Type(() => PersonUpdateWithoutCompanyInput)
  data!: PersonUpdateWithoutCompanyInput;
}
