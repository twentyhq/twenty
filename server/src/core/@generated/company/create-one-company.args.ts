import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CompanyCreateInput } from './company-create.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateOneCompanyArgs {
  @Field(() => CompanyCreateInput, { nullable: false })
  @Type(() => CompanyCreateInput)
  data!: CompanyCreateInput;
}
