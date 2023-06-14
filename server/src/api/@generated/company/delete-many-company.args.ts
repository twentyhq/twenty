import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CompanyWhereInput } from './company-where.input';
import { Type } from 'class-transformer';

@ArgsType()
export class DeleteManyCompanyArgs {
  @Field(() => CompanyWhereInput, { nullable: true })
  @Type(() => CompanyWhereInput)
  where?: CompanyWhereInput;
}
