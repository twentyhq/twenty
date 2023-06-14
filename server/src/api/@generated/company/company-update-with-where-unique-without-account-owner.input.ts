import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';
import { CompanyUpdateWithoutAccountOwnerInput } from './company-update-without-account-owner.input';

@InputType()
export class CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput {
  @Field(() => CompanyWhereUniqueInput, { nullable: false })
  @Type(() => CompanyWhereUniqueInput)
  where!: CompanyWhereUniqueInput;

  @Field(() => CompanyUpdateWithoutAccountOwnerInput, { nullable: false })
  @Type(() => CompanyUpdateWithoutAccountOwnerInput)
  data!: CompanyUpdateWithoutAccountOwnerInput;
}
