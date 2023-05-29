import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateWithoutPeopleInput } from './company-create-without-people.input';
import { Type } from 'class-transformer';
import { CompanyCreateOrConnectWithoutPeopleInput } from './company-create-or-connect-without-people.input';
import { CompanyUpsertWithoutPeopleInput } from './company-upsert-without-people.input';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { CompanyUpdateWithoutPeopleInput } from './company-update-without-people.input';

@InputType()
export class CompanyUpdateOneWithoutPeopleNestedInput {
  @Field(() => CompanyCreateWithoutPeopleInput, { nullable: true })
  @Type(() => CompanyCreateWithoutPeopleInput)
  create?: CompanyCreateWithoutPeopleInput;

  @Field(() => CompanyCreateOrConnectWithoutPeopleInput, { nullable: true })
  @Type(() => CompanyCreateOrConnectWithoutPeopleInput)
  connectOrCreate?: CompanyCreateOrConnectWithoutPeopleInput;

  @Field(() => CompanyUpsertWithoutPeopleInput, { nullable: true })
  @Type(() => CompanyUpsertWithoutPeopleInput)
  upsert?: CompanyUpsertWithoutPeopleInput;

  @Field(() => Boolean, { nullable: true })
  disconnect?: boolean;

  @Field(() => Boolean, { nullable: true })
  delete?: boolean;

  @Field(() => CompanyWhereUniqueInput, { nullable: true })
  @Type(() => CompanyWhereUniqueInput)
  connect?: CompanyWhereUniqueInput;

  @Field(() => CompanyUpdateWithoutPeopleInput, { nullable: true })
  @Type(() => CompanyUpdateWithoutPeopleInput)
  update?: CompanyUpdateWithoutPeopleInput;
}
