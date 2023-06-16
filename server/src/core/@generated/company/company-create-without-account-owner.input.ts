import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { PersonCreateNestedManyWithoutCompanyInput } from '../person/person-create-nested-many-without-company.input';
import { WorkspaceCreateNestedOneWithoutCompaniesInput } from '../workspace/workspace-create-nested-one-without-companies.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CompanyCreateWithoutAccountOwnerInput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => String, { nullable: false })
  name!: string;

  @Field(() => String, { nullable: false })
  domainName!: string;

  @Field(() => String, { nullable: false })
  address!: string;

  @Field(() => Int, { nullable: true })
  employees?: number;

  @Field(() => PersonCreateNestedManyWithoutCompanyInput, { nullable: true })
  people?: PersonCreateNestedManyWithoutCompanyInput;

  @HideField()
  workspace!: WorkspaceCreateNestedOneWithoutCompaniesInput;
}
