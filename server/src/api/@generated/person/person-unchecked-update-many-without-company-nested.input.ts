import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonCreateWithoutCompanyInput } from './person-create-without-company.input';
import { Type } from 'class-transformer';
import { PersonCreateOrConnectWithoutCompanyInput } from './person-create-or-connect-without-company.input';
import { PersonUpsertWithWhereUniqueWithoutCompanyInput } from './person-upsert-with-where-unique-without-company.input';
import { PersonCreateManyCompanyInputEnvelope } from './person-create-many-company-input-envelope.input';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { PersonUpdateWithWhereUniqueWithoutCompanyInput } from './person-update-with-where-unique-without-company.input';
import { PersonUpdateManyWithWhereWithoutCompanyInput } from './person-update-many-with-where-without-company.input';
import { PersonScalarWhereInput } from './person-scalar-where.input';

@InputType()
export class PersonUncheckedUpdateManyWithoutCompanyNestedInput {
  @Field(() => [PersonCreateWithoutCompanyInput], { nullable: true })
  @Type(() => PersonCreateWithoutCompanyInput)
  create?: Array<PersonCreateWithoutCompanyInput>;

  @Field(() => [PersonCreateOrConnectWithoutCompanyInput], { nullable: true })
  @Type(() => PersonCreateOrConnectWithoutCompanyInput)
  connectOrCreate?: Array<PersonCreateOrConnectWithoutCompanyInput>;

  @Field(() => [PersonUpsertWithWhereUniqueWithoutCompanyInput], {
    nullable: true,
  })
  @Type(() => PersonUpsertWithWhereUniqueWithoutCompanyInput)
  upsert?: Array<PersonUpsertWithWhereUniqueWithoutCompanyInput>;

  @Field(() => PersonCreateManyCompanyInputEnvelope, { nullable: true })
  @Type(() => PersonCreateManyCompanyInputEnvelope)
  createMany?: PersonCreateManyCompanyInputEnvelope;

  @Field(() => [PersonWhereUniqueInput], { nullable: true })
  @Type(() => PersonWhereUniqueInput)
  set?: Array<PersonWhereUniqueInput>;

  @Field(() => [PersonWhereUniqueInput], { nullable: true })
  @Type(() => PersonWhereUniqueInput)
  disconnect?: Array<PersonWhereUniqueInput>;

  @Field(() => [PersonWhereUniqueInput], { nullable: true })
  @Type(() => PersonWhereUniqueInput)
  delete?: Array<PersonWhereUniqueInput>;

  @Field(() => [PersonWhereUniqueInput], { nullable: true })
  @Type(() => PersonWhereUniqueInput)
  connect?: Array<PersonWhereUniqueInput>;

  @Field(() => [PersonUpdateWithWhereUniqueWithoutCompanyInput], {
    nullable: true,
  })
  @Type(() => PersonUpdateWithWhereUniqueWithoutCompanyInput)
  update?: Array<PersonUpdateWithWhereUniqueWithoutCompanyInput>;

  @Field(() => [PersonUpdateManyWithWhereWithoutCompanyInput], {
    nullable: true,
  })
  @Type(() => PersonUpdateManyWithWhereWithoutCompanyInput)
  updateMany?: Array<PersonUpdateManyWithWhereWithoutCompanyInput>;

  @Field(() => [PersonScalarWhereInput], { nullable: true })
  @Type(() => PersonScalarWhereInput)
  deleteMany?: Array<PersonScalarWhereInput>;
}
