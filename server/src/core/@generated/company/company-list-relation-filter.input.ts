import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyWhereInput } from './company-where.input';

@InputType()
export class CompanyListRelationFilter {
  @Field(() => CompanyWhereInput, { nullable: true })
  every?: CompanyWhereInput;

  @Field(() => CompanyWhereInput, { nullable: true })
  some?: CompanyWhereInput;

  @Field(() => CompanyWhereInput, { nullable: true })
  none?: CompanyWhereInput;
}
