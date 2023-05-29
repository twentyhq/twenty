import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';
import { CompanyUpdateWithoutWorkspaceInput } from './company-update-without-workspace.input';
import { CompanyCreateWithoutWorkspaceInput } from './company-create-without-workspace.input';

@InputType()
export class CompanyUpsertWithWhereUniqueWithoutWorkspaceInput {
  @Field(() => CompanyWhereUniqueInput, { nullable: false })
  @Type(() => CompanyWhereUniqueInput)
  where!: CompanyWhereUniqueInput;

  @Field(() => CompanyUpdateWithoutWorkspaceInput, { nullable: false })
  @Type(() => CompanyUpdateWithoutWorkspaceInput)
  update!: CompanyUpdateWithoutWorkspaceInput;

  @Field(() => CompanyCreateWithoutWorkspaceInput, { nullable: false })
  @Type(() => CompanyCreateWithoutWorkspaceInput)
  create!: CompanyCreateWithoutWorkspaceInput;
}
