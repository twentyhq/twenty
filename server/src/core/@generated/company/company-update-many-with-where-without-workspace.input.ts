import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyScalarWhereInput } from './company-scalar-where.input';
import { Type } from 'class-transformer';
import { CompanyUpdateManyMutationInput } from './company-update-many-mutation.input';

@InputType()
export class CompanyUpdateManyWithWhereWithoutWorkspaceInput {
  @Field(() => CompanyScalarWhereInput, { nullable: false })
  @Type(() => CompanyScalarWhereInput)
  where!: CompanyScalarWhereInput;

  @Field(() => CompanyUpdateManyMutationInput, { nullable: false })
  @Type(() => CompanyUpdateManyMutationInput)
  data!: CompanyUpdateManyMutationInput;
}
