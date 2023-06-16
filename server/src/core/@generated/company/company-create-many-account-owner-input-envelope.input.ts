import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateManyAccountOwnerInput } from './company-create-many-account-owner.input';
import { Type } from 'class-transformer';

@InputType()
export class CompanyCreateManyAccountOwnerInputEnvelope {
  @Field(() => [CompanyCreateManyAccountOwnerInput], { nullable: false })
  @Type(() => CompanyCreateManyAccountOwnerInput)
  data!: Array<CompanyCreateManyAccountOwnerInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
