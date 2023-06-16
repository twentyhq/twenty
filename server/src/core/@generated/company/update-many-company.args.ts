import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CompanyUpdateManyMutationInput } from './company-update-many-mutation.input';
import { Type } from 'class-transformer';
import { CompanyWhereInput } from './company-where.input';

@ArgsType()
export class UpdateManyCompanyArgs {
  @Field(() => CompanyUpdateManyMutationInput, { nullable: false })
  @Type(() => CompanyUpdateManyMutationInput)
  data!: CompanyUpdateManyMutationInput;

  @Field(() => CompanyWhereInput, { nullable: true })
  @Type(() => CompanyWhereInput)
  where?: CompanyWhereInput;
}
