import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CompanyCreateManyInput } from './company-create-many.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateManyCompanyArgs {
  @Field(() => [CompanyCreateManyInput], { nullable: false })
  @Type(() => CompanyCreateManyInput)
  data!: Array<CompanyCreateManyInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
